
## 1. Cosine Similarity Algorithm (Face Recognition)

**Description:** Computes cosine similarity between two face embedding vectors to determine if they match. This is the core algorithm for face recognition. Returns a value between -1 and 1, where 1 means identical faces.

```php
private function cosine(array $a, array $b): float
{
    $n = min(count($a), count($b));
    if ($n === 0) return -1.0;

    $dot = 0.0; $na = 0.0; $nb = 0.0;
    for ($i = 0; $i < $n; $i++) {
        $dot += $a[$i] * $b[$i];
        $na  += $a[$i] * $a[$i];
        $nb  += $b[$i] * $b[$i];
    }
    $den = sqrt($na) * sqrt($nb);
    return $den > 0 ? $dot / $den : -1.0;
}
```

## 2. Best Face Match Algorithm

**Description:** Iterates through all stored face templates to find the best matching employee by comparing embeddings using cosine similarity. Uses chunking to handle large datasets efficiently.

```php
private function findBestMatch(array $probe): array
{
    $best = null;
    $bestScore = -1.0;

    FaceTemplate::with('employee:id,emp_code')->chunk(300, function ($chunk) use (&$best, &$bestScore, $probe) {
        foreach ($chunk as $tpl) {
            $score = $this->cosine($probe, $tpl->embedding ?? []);
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $tpl->employee;
            }
        }
    });

    return [$best, $bestScore];
}
```

## 3. Time Window Validation Algorithm

**Description:** Validates if current time falls within attendance time windows (e.g., 6:00-8:00 for time-in). Handles edge cases like windows that span past midnight and includes late detection with grace period.

```php
private function timeBetweenWrap(Carbon $now, string $startHHMM, string $endHHMM): bool
{
    [$sh, $sm] = array_map('intval', explode(':', $startHHMM));
    [$eh, $em] = array_map('intval', explode(':', $endHHMM));
    $start = (clone $now)->setTime($sh, $sm, 0);
    $end   = (clone $now)->setTime($eh, $em, 59);

    // If the end is before the start, the window wraps past midnight
    if ($end->lt($start)) {
        $end->addDay();
        $nowAdj = clone $now;
        if ($nowAdj->lt($start)) {
            $nowAdj->addDay();
        }
        return $nowAdj->greaterThanOrEqualTo($start) && $nowAdj->lessThanOrEqualTo($end);
    }

    return $now->greaterThanOrEqualTo($start) && $now->lessThanOrEqualTo($end);
}
```

## 4. Attendance Recognition & Logging (Main Flow)

**Description:** Main endpoint for face recognition and attendance marking. Accepts image or embedding, validates against schedule, prevents duplicates, and determines if employee is late.

```php
public function proxy(Request $req)
{
    $req->validate([
        'action'    => 'nullable|in:time_in,time_out,auto',
        'image'     => 'required_without:embedding|image|max:4096',
        'embedding' => 'nullable|string',
        'device_id' => 'nullable|integer',
        'api_key'   => 'nullable|string',
    ]);

    $action  = $req->input('action') ?: 'auto';
    
    // Extract or receive face embedding
    if ($req->filled('embedding')) {
        $arr = json_decode($req->input('embedding'), true);
        $probe = array_map('floatval', array_slice($arr, 0, 512));
    } else {
        // Send to FastAPI for face detection
        $resp = Http::asMultipart()
            ->attach('image', file_get_contents($req->file('image')->getRealPath()))
            ->post("$fastapi/api/recognize");
        $json = $resp->json();
        $probe = $json['embedding'];
    }
    
    // Find best matching employee
    [$bestEmployee, $bestScore] = $this->findBestMatch($probe);
    
    // Validate confidence threshold
    $threshold = (float) config("services.recognition.threshold", 0.65);
    if ($bestScore < $threshold) {
        return response()->json([
            'message' => 'Face not recognized. Please register first.',
            'confidence' => $bestScore,
        ], 422);
    }

    $employeeId = $bestEmployee?->id;
    $now = Carbon::now();
    
    // Load attendance schedule
    $schedule = Setting::getCached('attendance.schedule', [
        'in_start'  => '06:00',
        'in_end'    => '08:00',
        'out_start' => '16:00',
        'out_end'   => '17:00',
        'days'      => [1,2,3,4,5],
        'late_after'=> null,
        'late_grace'=> 0,
    ]);

    // Validate day and time windows
    $dayIso = $now->dayOfWeekIso;
    $enabledDays = collect($schedule['days'] ?? [])->map(fn($d) => (int)$d)->all();
    $dayEnabled = in_array($dayIso, $enabledDays, true);
    
    $inWindow  = $dayEnabled && $this->timeBetweenWrap($now, $schedule['in_start'], $schedule['in_end']);
    $outWindow = $dayEnabled && $this->timeBetweenWrap($now, $schedule['out_start'], $schedule['out_end']);

    // Calculate if late
    $isLate = false;
    $lateBase = $schedule['late_after'] ?? ($schedule['in_end'] ?? null);
    if (!empty($lateBase)) {
        [$lh, $lm] = array_map('intval', explode(':', $lateBase));
        $lateGrace = (int)($schedule['late_grace'] ?? 0);
        $lateThreshold = (clone $now)->setTime($lh, $lm, 0)->addMinutes($lateGrace);
        $isLate = $now->greaterThan($lateThreshold);
    }

    // Prevent duplicate marking
    if ($employeeId) {
        $todayLogs = AttendanceLog::where('employee_id', $employeeId)
            ->whereDate('logged_at', $now->toDateString())
            ->get(['action', 'logged_at']);

        $existingSame = $todayLogs->firstWhere('action', $chosenAction);
        if ($existingSame) {
            return response()->json([
                'already_marked' => true,
                'message' => 'Already marked today.',
            ], 200);
        }
    }

    // Create attendance log
    AttendanceLog::create([
        'employee_id'   => $employeeId,
        'emp_code'      => $empCode,
        'action'        => $chosenAction,
        'is_late'       => ($chosenAction === 'time_in' && $isLate),
        'logged_at'     => $now,
        'confidence'    => $bestScore,
        'liveness_pass' => (bool)($json['liveness_pass'] ?? false),
        'device_id'     => $req->input('device_id'),
        'meta'          => ['model' => $json['model'] ?? 'unknown'],
    ]);

    return response()->json([
        'employee_id'     => $employeeId,
        'confidence'      => $bestScore,
        'action'          => $chosenAction,
        'is_late'         => ($chosenAction === 'time_in' && $isLate),
    ]);
}
```

## 5. Face Registration Algorithm

**Description:** Registers a new face template by extracting embeddings from an image and storing it in the database. Supports both server-side (FastAPI) and client-side (face-api.js) embedding extraction.

```php
public function register(Request $req)
{
    $req->validate([
        'emp_code'   => 'required|string|max:50',
        'image'      => 'required|image|max:4096',
        'name'       => 'nullable|string|max:200',
        'email'      => 'nullable|email|max:255',
        'embedding'  => 'nullable|string',
    ]);

    $embedding = null;
    $model     = null;
    
    // Check if client provided embedding
    if ($req->filled('embedding')) {
        $decoded = json_decode($req->input('embedding'), true);
        $embedding = array_map('floatval', array_slice($decoded, 0, 512));
        $model     = 'face-api.js';
    } else {
        // Send to FastAPI for embedding extraction
        $resp = Http::timeout(30)
            ->asMultipart()
            ->attach('image', file_get_contents($req->file('image')->getRealPath()), 'face.jpg')
            ->post("$fastapi/api/embed", ['api_key' => $apiKey]);
        
        $responseData = $resp->json();
        $embedding = $responseData['embedding'];
        $model     = $responseData['model'] ?? 'face_recognition_dlib';
    }

    // Database transaction for integrity
    return DB::transaction(function () use ($req, $embedding, $model) {
        // Find or create employee
        $employee = Employee::where('emp_code', $req->emp_code)->first();
        
        if (!$employee) {
            $nameParts = explode(' ', $req->name ?? 'Unknown User', 2);
            $employee = Employee::create([
                'emp_code'   => $req->emp_code,
                'first_name' => $nameParts[0] ?? 'Unknown',
                'last_name'  => $nameParts[1] ?? 'User',
                'email'      => $req->email,
                'active'     => true,
            ]);
        }

        // Store image and face template
        $imagePath = $req->file('image')->store('face_templates/' . $employee->id, 'public');
        
        $faceTemplate = FaceTemplate::create([
            'employee_id' => $employee->id,
            'image_path'  => $imagePath,
            'embedding'   => $embedding,
            'model'       => $model,
            'source'      => 'face_capture',
        ]);

        return response()->json([
            'message' => 'Face registered successfully',
            'employee_id' => $employee->id,
            'employee_name' => $employee->full_name,
        ], 201);
    });
}
```

## 6. Employee Attendance Query Algorithm

**Description:** Retrieves attendance records for an employee with date range filtering. Groups logs by date and determines status (Present, Absent, Late, Half Day).

```php
public function index(Request $request)
{
    // Find employee by email or emp_code
    $employee = null;
    if (!empty($data['email'])) {
        $employee = Employee::where('email', $data['email'])->first();
    }
    if (!$employee && !empty($reqEmpCode)) {
        $employee = Employee::where('emp_code', $reqEmpCode)->first();
    }

    // Date range with default to last 30 days
    $to = !empty($data['to']) ? Carbon::createFromFormat('Y-m-d', $data['to'])->endOfDay() : Carbon::now();
    $from = !empty($data['from']) ? Carbon::createFromFormat('Y-m-d', $data['from'])->startOfDay() : (clone $to)->subDays(29)->startOfDay();

    // Fetch logs for employee
    $logs = AttendanceLog::where(function($q) use ($employee, $reqEmpCode) {
            if ($employee) {
                $q->where('employee_id', $employee->id)
                  ->orWhere('emp_code', $employee->emp_code);
            }
        })
        ->whereBetween('logged_at', [$from, $to])
        ->orderBy('logged_at', 'asc')
        ->get(['id', 'action', 'logged_at']);

    // Group by date and build records
    $grouped = [];
    foreach ($logs as $log) {
        $day = $log->logged_at->toDateString();
        if (!isset($grouped[$day])) {
            $grouped[$day] = ['date' => $day, 'check_in' => null, 'check_out' => null];
        }
        
        if ($log->action === 'time_in') {
            $grouped[$day]['check_in'] = $log->logged_at->toIso8601String();
        }
        if ($log->action === 'time_out') {
            $grouped[$day]['check_out'] = $log->logged_at->toIso8601String();
        }
    }

    // Determine status for each day
    $records = [];
    foreach ($grouped as $day => $row) {
        $status = 'Present';
        if (!$row['check_in'] && !$row['check_out']) {
            $status = 'Absent';
        } elseif ($row['check_in'] && !$row['check_out']) {
            $status = 'Half Day';
        } elseif (!empty($row['check_in']) && !empty($lateBase)) {
            $cin = Carbon::parse($row['check_in']);
            $lateThreshold = Carbon::createFromFormat('Y-m-d H:i', $day.' '.$lateBase)->addMinutes($lateGrace);
            if ($cin->gt($lateThreshold)) {
                $status = 'Late';
            }
        }

        $records[] = [
            'id' => $employee->id . '_' . $day,
            'checkInTime' => $row['check_in'],
            'checkOutTime' => $row['check_out'],
            'status' => $status,
        ];
    }

    return response()->json($records);
}
```

## 7. Daily Time Records Generation Algorithm

**Description:** Generates comprehensive daily time records for attendance reporting. Fills in absent days, calculates duration, and determines status.

```php
private function getDailyTimeRecords(): Collection
{
    [$startDate, $endDate] = $this->resolveDateRange();
    $dates = $this->generateDateSeries($startDate, $endDate);

    $logs = $this->getFilteredQuery()->reorder()->get();
    
    return $logs
        ->groupBy(function ($log) {
            $empId = $log->employee_id ?: 'unassigned';
            $empCode = $log->emp_code ?: optional($log->employee)->emp_code ?: 'N/A';
            return "{$empId}-{$empCode}";
        })
        ->sortBy(function ($employeeLogs) {
            $employee = $employeeLogs->first()->employee;
            return strtoupper($employee->full_name);
        })
        ->flatMap(function ($employeeLogs) use ($dates) {
            $employee = $employeeLogs->first()->employee;
            $empCode = $employee->emp_code ?? 'N/A';
            $employeeName = $employee?->full_name ?? 'Unassigned Employee';
            
            $logsByDate = $employeeLogs
                ->sortBy('logged_at')
                ->groupBy(fn ($log) => $log->logged_at->toDateString());

            return $dates->map(function (Carbon $date) use ($logsByDate, $empCode, $employeeName) {
                $dateKey = $date->toDateString();
                $dayLogs = $logsByDate->get($dateKey, collect())->sortBy('logged_at')->values();

                if ($dayLogs->isEmpty()) {
                    return [
                        'emp_code' => $empCode,
                        'employee_name' => $employeeName,
                        'date' => $dateKey,
                        'time_in' => null,
                        'time_out' => null,
                        'total_duration' => null,
                        'status' => 'Absent',
                        'remarks' => 'Absent',
                    ];
                }

                $timeInLog = $dayLogs->firstWhere('action', 'time_in');
                $timeOutLog = $dayLogs->filter(fn ($log) => $log->action === 'time_out')->last();

                $remarks = collect();
                if (!$timeInLog) {
                    $remarks->push('Missing time in');
                } elseif ($timeInLog->is_late) {
                    $remarks->push('Late');
                }
                if (!$timeOutLog) {
                    $remarks->push('Missing time out');
                }

                $status = 'Present';
                if ($remarks->contains('Missing time in') || $remarks->contains('Missing time out')) {
                    $status = 'Incomplete';
                }

                $totalMinutes = null;
                if ($timeInLog && $timeOutLog && $timeOutLog->logged_at->gt($timeInLog->logged_at)) {
                    $totalMinutes = $timeInLog->logged_at->diffInMinutes($timeOutLog->logged_at);
                }

                return [
                    'emp_code' => $empCode,
                    'employee_name' => $employeeName,
                    'date' => $dateKey,
                    'time_in' => $timeInLog?->logged_at?->format('h:i A'),
                    'time_out' => $timeOutLog?->logged_at?->format('h:i A'),
                    'total_duration' => $this->formatDuration($totalMinutes),
                    'status' => $status,
                    'remarks' => $remarks->isEmpty() ? null : $remarks->implode(', '),
                ];
            });
        })
        ->values();
}
```

## 8. Client-Side Face Detection & Matching (JavaScript)

**Description:** Real-time face detection and recognition using face-api.js in the browser. Continuously detects faces, extracts descriptors, and matches against known faces using Euclidean distance.

```javascript
function startDetectionLoop() {
  const displaySize = {
    width: video.videoWidth || video.width,
    height: video.videoHeight || video.height,
  };

  faceapi.matchDimensions(canvas, displaySize);

  const tick = async () => {
    try {
      // Detect all faces with landmarks and descriptors
      const dets = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resized = faceapi.resizeResults(dets, displaySize);
      
      // Draw detection boxes and landmarks
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      if (resized.length === 0) {
        status('No face detected.');
        setButtonsEnabled(false);
      } else {
        // Use the largest face (by box area)
        const largest = resized.reduce((a, b) => {
          const areaA = a.detection.box.width * a.detection.box.height;
          const areaB = b.detection.box.width * b.detection.box.height;
          return areaB > areaA ? b : a;
        });
        
        const descriptor = largest.descriptor;
        const { label, distance } = findBestMatch(descriptor);
        
        if (label && distance <= MATCH_THRESHOLD) {
          ok(`Ready: ${label} (distance ${distance.toFixed(4)})`);
          setButtonsEnabled(true);
          
          // Auto-mark attendance if enabled
          if (AUTO_MODE) {
            const now = Date.now();
            const onCooldown = now - lastMarkTs < AUTO_COOLDOWN_MS;
            if (!isMarking && !onCooldown) {
              doMark('AUTO');
            }
          }
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}
```

## 9. Client-Side Best Match Algorithm (JavaScript)

**Description:** Finds the best matching face from known templates using Euclidean distance calculation. Lower distance means better match.

```javascript
function findBestMatch(queryDescr /* Float32Array */) {
  if (!descriptors.length) return { label: null, distance: null };

  let bestIdx = -1;
  let bestDist = Infinity;
  
  for (let i = 0; i < descriptors.length; i++) {
    const dist = faceapi.euclideanDistance(queryDescr, descriptors[i]);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  
  const label = (bestIdx >= 0) ? labels[bestIdx] : null;
  return { label, distance: bestDist };
}
```

## 10. Face Capture & Registration (JavaScript)

**Description:** Captures face from webcam, extracts descriptor using face-api.js, and sends to server for registration with employee details.

```javascript
document.getElementById('captureBtn').addEventListener('click', async () => {
  const det = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!det) {
    statusDiv.textContent = 'No face detected. Try again.';
    return;
  }

  capturedDescriptor = Array.from(det.descriptor);
  statusDiv.textContent = 'Face captured successfully!';
});

document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Create canvas to capture current frame
  const canvasEl = document.createElement('canvas');
  const ctx = canvasEl.getContext('2d');
  canvasEl.width = video.videoWidth || 640;
  canvasEl.height = video.videoHeight || 480;
  ctx.drawImage(video, 0, 0, canvasEl.width, canvasEl.height);
  
  // Convert to blob
  const blob = await new Promise((resolve) => {
    canvasEl.toBlob(resolve, 'image/jpeg', 0.85);
  });
  
  // Send to server with embedding
  const formData = new FormData();
  formData.append('emp_code', empCode);
  formData.append('name', name);
  formData.append('email', email);
  formData.append('image', blob, 'face.jpg');
  formData.append('embedding', JSON.stringify(capturedDescriptor));
  
  const res = await fetch('/api/register-face', {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': csrfToken },
    body: formData
  });
  
  const data = await res.json();
  if (res.ok) {
    statusDiv.textContent = `Registration successful! Employee: ${data.employee_name}`;
  }
});
```

## 11. Mobile Authentication Algorithm

**Description:** Secure mobile login endpoint that validates employee credentials using hashed passwords and returns authentication token.

```php
public function login(Request $request)
{
    $data = $request->only(['email', 'emp_code', 'password']);

    $validator = Validator::make($data, [
        'email' => 'nullable|email',
        'emp_code' => 'nullable|string|max:50',
        'password' => 'required|string|min:6',
    ]);

    // Find employee by email or emp_code
    $employee = null;
    if (!empty($data['email'])) {
        $employee = Employee::where('email', $data['email'])->first();
    }
    if (!$employee && !empty($data['emp_code'])) {
        $employee = Employee::where('emp_code', $data['emp_code'])->first();
    }

    if (!$employee) {
        return response()->json([
            'success' => false,
            'message' => 'Employee not found',
        ], 404);
    }

    // Verify password
    if (empty($employee->password) || !Hash::check($data['password'], $employee->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }

    // Generate authentication token
    $token = Str::random(60);

    return response()->json([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $employee->id,
            'name' => $employee->full_name,
            'email' => $employee->email,
            'department' => $employee->department,
            'emp_code' => $employee->emp_code,
        ],
    ]);
}
```

## 12. Department-Based Employee Filtering Algorithm

**Description:** Retrieves employees filtered by department and course with support for nested department/course combinations.

```php
public function __invoke(?string $department = null): JsonResponse
{
    $department = ($department === null || $department === '' || strtolower($department) === 'all')
        ? null
        : urldecode($department);

    $deptName = null;
    $courseName = null;
    
    // Parse department/course combination
    if ($department) {
        if (Str::contains($department, '/')) {
            [$deptName, $courseName] = array_map('trim', explode('/', $department, 2));
        } else {
            $deptName = trim($department);
        }
    }

    // Query with conditional filters
    $employees = Employee::query()
        ->when($deptName, function ($query) use ($deptName) {
            $query->where('department', $deptName);
        })
        ->when($courseName, function ($query) use ($courseName) {
            $query->where(function ($scope) use ($courseName) {
                $scope->where('course', $courseName)
                    ->orWhereNull('course');
            });
        })
        ->orderBy('first_name')
        ->orderBy('last_name')
        ->get(['id', 'emp_code', 'first_name', 'last_name', 'department']);

    $data = $employees->map(function (Employee $employee) {
        return [
            'id' => $employee->id,
            'department' => $employee->department ?? '-',
            'label' => trim(($employee->emp_code ?? 'N/A') . ' (' . $employee->full_name . ')'),
        ];
    });

    return response()->json(['data' => $data]);
}
```

## 13. Attendance Data Export Algorithm

**Description:** Exports attendance logs to Excel/CSV with comprehensive filtering and mapping including late detection and work duration calculations.

```php
class AttendanceLogsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection(): Collection
    {
        return $this->query->get();
    }

    public function headings(): array
    {
        return [
            'Employee Code',
            'Employee Name',
            'Department',
            'Course',
            'Position',
            'Action',
            'Status',
            'Logged At',
            'Late Minutes',
            'Minutes Worked',
            'Device / Source',
            'Confidence',
            'Notes',
            'Generated At',
            'Filter Range',
        ];
    }

    public function map($log): array
    {
        $employee = $log->employee;
        
        // Determine status based on action and lateness
        $status = $log->action === 'time_in'
            ? ($log->is_late ? 'time_in_late' : 'time_in_on_time')
            : $log->action;

        $filterRange = trim(($this->filters['date_from'] ?? '') . ' - ' . ($this->filters['date_to'] ?? ''));
        
        $lateMinutes = data_get($log->meta, 'late_minutes', $log->is_late ? 1 : 0);
        $minutesWorked = data_get($log->meta, 'minutes_worked');
        $device = data_get($log->meta, 'device', $log->device_id ?? 'N/A');

        return [
            $log->emp_code ?? $employee?->emp_code ?? 'N/A',
            $employee?->full_name ?? 'Unassigned Employee',
            $employee?->department ?? '-',
            $employee?->course ?? '-',
            $employee?->position ?? '-',
            $log->action,
            $status,
            optional($log->logged_at)->format('Y-m-d H:i:s'),
            $lateMinutes,
            $minutesWorked,
            $device,
            $log->confidence ?? '-',
            data_get($log->meta, 'notes'),
            now()->format('Y-m-d H:i:s'),
            $filterRange,
        ];
    }
}
```

## 14. Two-Year Attendance Seeder Algorithm

**Description:** Generates deterministic attendance data for testing and demonstration purposes. Creates realistic patterns including present, late, half-day, and absent records.

```php
protected function seedForEmployee(Employee $employee, Carbon $start, Carbon $end): void
{
    $inserts = [];
    $day = $start->copy();
    
    while ($day->lessThanOrEqualTo($end)) {
        // Skip weekends
        if (!in_array($day->dayOfWeekIso, [6, 7], true)) {
            // Deterministic randomization per employee/day
            $rand = crc32($employee->id . '_' . $day->toDateString()) % 100;

            // Distributions: 80% present, 10% late, 5% half day, 5% absent
            $present = $rand < 80 || ($rand >= 80 && $rand < 90);
            $halfDay = $rand >= 90 && $rand < 95;
            $absent  = $rand >= 95;

            if ($present || $halfDay) {
                if ($present && $rand < 80) {
                    // On time
                    $inTime  = $day->copy()->setTime(8, 30 + ($rand % 10));
                    $outTime = $day->copy()->setTime(17, 30 + ($rand % 10));
                } elseif ($present) {
                    // Late
                    $inTime  = $day->copy()->setTime(9, 10 + ($rand % 20));
                    $outTime = $day->copy()->setTime(17, 40 + ($rand % 10));
                } else { // half day
                    $inTime  = $day->copy()->setTime(8, 30);
                    $outTime = $day->copy()->setTime(12, 30);
                }

                $inserts[] = [
                    'employee_id'   => $employee->id,
                    'emp_code'      => $employee->emp_code,
                    'action'        => 'time_in',
                    'logged_at'     => $inTime,
                    'confidence'    => 0.98,
                    'liveness_pass' => true,
                ];

                $inserts[] = [
                    'employee_id'   => $employee->id,
                    'emp_code'      => $employee->emp_code,
                    'action'        => 'time_out',
                    'logged_at'     => $outTime,
                    'confidence'    => 0.99,
                    'liveness_pass' => true,
                ];
            }
        }

        // Batch insert for performance
        if (count($inserts) >= 1000) {
            DB::table('attendance_logs')->insert($inserts);
            $inserts = [];
        }

        $day->addDay();
    }

    if (!empty($inserts)) {
        DB::table('attendance_logs')->insert($inserts);
    }
}
```

## 15. Attendance Schedule Configuration

**Description:** Stores and retrieves attendance schedule settings including time windows, enabled days, late thresholds, and date ranges with caching support.

```php
class AttendanceSchedule extends Component
{
    public string $in_start = '06:00';
    public string $in_end   = '08:00';
    public string $out_start= '16:00';
    public string $out_end  = '17:00';
    public array $days = [1,2,3,4,5]; // 1=Mon .. 7=Sun
    public ?string $from_date = null;
    public ?string $to_date   = null;
    public ?string $late_after = null;
    public int $late_grace = 0;

    public function save(): void
    {
        $this->validate([
            'in_start'  => 'required|date_format:H:i',
            'in_end'    => 'required|date_format:H:i',
            'out_start' => 'required|date_format:H:i',
            'out_end'   => 'required|date_format:H:i',
            'days'      => 'array|min:1',
            'days.*'    => 'integer|min:1|max:7',
            'from_date' => 'nullable|date',
            'to_date'   => 'nullable|date|after_or_equal:from_date',
            'late_after'=> 'nullable|date_format:H:i',
            'late_grace'=> 'integer|min:0|max:180',
        ]);

        Setting::setValue('attendance.schedule', [
            'in_start'  => $this->in_start,
            'in_end'    => $this->in_end,
            'out_start' => $this->out_start,
            'out_end'   => $this->out_end,
            'days'      => array_values($this->days),
            'from_date' => $this->from_date,
            'to_date'   => $this->to_date,
            'late_after'=> $this->late_after,
            'late_grace'=> $this->late_grace,
        ]);

        session()->flash('status', 'Attendance schedule saved.');
    }
}
```

## 16. Settings Cache Management

**Description:** Manages application settings with caching support for improved performance. Provides methods to get, set, and cache settings with automatic cache invalidation.

```php
class Setting extends Model
{
    protected $fillable = ['key', 'value'];
    protected $casts = ['value' => 'array'];

    public static function getValue(string $key, $default = null)
    {
        $row = static::where('key', $key)->first();
        return $row?->value ?? $default;
    }

    public static function setValue(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget(static::cacheKey($key));
    }

    public static function getCached(string $key, $default = null, int $ttl = 60)
    {
        return Cache::remember(static::cacheKey($key), $ttl, function () use ($key, $default) {
            $row = static::where('key', $key)->first();
            return $row?->value ?? $default;
        });
    }

    protected static function cacheKey(string $key): string
    {
        return 'settings:'.$key;
    }
}
```

## 17. Dashboard Statistics Algorithm

**Description:** Calculates real-time dashboard statistics including total employees, present count, late count, and absent count for the current day.

```php
Route::get('dashboard', function () {
    $totalEmployees = \App\Models\Employee::count();

    $start = \Carbon\Carbon::today()->startOfDay();
    $end   = \Carbon\Carbon::today()->endOfDay();

    // Present = distinct employees with a check-in today
    $present = \App\Models\AttendanceLog::query()
        ->whereIn('action', ['time_in','check_in','in'])
        ->whereBetween(\Illuminate\Support\Facades\DB::raw('COALESCE(logged_at, created_at)'), [$start, $end])
        ->distinct('employee_id')
        ->count('employee_id');

    // Late = check-in after threshold
    $cfg = \App\Models\Setting::getValue('attendance.schedule');
    $threshold = '09:00';
    if (is_array($cfg) && !empty($cfg['in_end'])) { 
        $threshold = $cfg['in_end']; 
    }

    $late = \App\Models\AttendanceLog::query()
        ->whereIn('action', ['time_in','check_in','in'])
        ->whereBetween(\Illuminate\Support\Facades\DB::raw('COALESCE(logged_at, created_at)'), [$start, $end])
        ->whereTime(\Illuminate\Support\Facades\DB::raw('COALESCE(logged_at, created_at)'), '>', $threshold)
        ->distinct('employee_id')
        ->count('employee_id');

    $absent = max(0, $totalEmployees - $present);

    return view('dashboard', compact('totalEmployees','present','late','absent'));
});
```

## 18. Weekly Attendance Chart Algorithm

**Description:** Generates attendance chart data showing distinct employee check-ins per day for the current week.

```php
class AttendanceChart extends Component
{
    public $chartData = [];

    public function mount()
    {
        $start = Carbon::now()->startOfWeek();
        $end   = Carbon::now()->endOfWeek();

        // Aggregate distinct employees who checked in per day
        $rows = DB::table('attendance_logs')
            ->selectRaw('DATE(COALESCE(logged_at, created_at)) as d, COUNT(DISTINCT employee_id) as c')
            ->whereIn('action', ['time_in','check_in','in'])
            ->whereBetween(DB::raw('COALESCE(logged_at, created_at)'), [$start, $end])
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $labels = [];
        $values = [];
        $cursor = $start->copy();
        
        while ($cursor->lessThanOrEqualTo($end)) {
            $d = $cursor->toDateString();
            $labels[] = $cursor->format('D');
            $values[] = (int) ($rows[$d]->c ?? 0);
            $cursor->addDay();
        }

        $this->chartData = [
            'labels' => $labels,
            'values' => $values,
        ];
    }
}
```

## 19. Department Distribution Chart Algorithm

**Description:** Generates department distribution chart showing employee count per department with error handling.

```php
class DepartmentChart extends Component
{
    public array $labels = [];
    public array $values = [];

    public function mount(): void
    {
        try {
            $rows = DB::table('employees')
                ->select('department', DB::raw('COUNT(*) as total'))
                ->groupBy('department')
                ->orderBy('department')
                ->get();

            if ($rows->count()) {
                $this->labels = $rows->pluck('department')->map(fn($v) => $v ?? 'Unassigned')->all();
                $this->values = $rows->pluck('total')->all();
            } else {
                $this->labels = ['Unassigned'];
                $this->values = [0];
            }
        } catch (\Throwable $e) {
            // Fallback when column doesn't exist
            $this->labels = ['Sample A', 'Sample B'];
            $this->values = [5, 3];
        }
    }
}
```

## 20. Employee Search & Filter Algorithm

**Description:** Advanced employee search and filtering with support for department/course combinations and pagination.

```php
public function render()
{
    $selected = trim((string) $this->department);
    $combinedExpression = "TRIM(REPLACE(CONCAT_WS('/', department, NULLIF(course, '')), '//', '/'))";

    $employees = Employee::query()
        ->withCount('templates')
        ->when($this->q, function ($query) {
            $search = '%' . $this->q . '%';
            $query->where(function ($q) use ($search) {
                $q->where('emp_code', 'like', $search)
                  ->orWhere('first_name', 'like', $search)
                  ->orWhere('last_name', 'like', $search)
                  ->orWhere('department', 'like', $search)
                  ->orWhere('course', 'like', $search)
                  ->orWhereRaw("CONCAT_WS('/', department, course) like ?", [$search]);
            });
        })
        ->when($selected !== '', function ($query) use ($selected, $combinedExpression) {
            $query->where(function ($scope) use ($selected, $combinedExpression) {
                $scope->whereRaw("$combinedExpression = ?", [$selected])
                      ->orWhereRaw("TRIM(department) = ?", [$selected])
                      ->orWhereRaw("TRIM(course) = ?", [$selected]);
            });
        })
        ->when($this->selectedEmployee, function ($query) {
            $query->where('id', $this->selectedEmployee);
        })
        ->orderBy('id', 'desc')
        ->paginate($this->perPage);

    return view('livewire.employees.index', ['employees' => $employees]);
}
```
