<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Collection Schedule Assignment</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.8;
            color: #1a1a1a;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border: 1px solid #d0d0d0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .letterhead {
            background-color: #1a472a;
            color: #ffffff;
            padding: 25px 30px;
            border-bottom: 3px solid #2d5f3f;
        }
        .letterhead h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .letterhead p {
            margin: 5px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 35px;
            background-color: #ffffff;
        }
        .document-title {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        .document-title h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1a472a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .greeting {
            margin-bottom: 25px;
            font-size: 15px;
        }
        .body-text {
            margin-bottom: 25px;
            text-align: justify;
            font-size: 14px;
            line-height: 1.9;
        }
        .schedule-details {
            margin: 30px 0;
            border: 2px solid #1a472a;
            background-color: #f9f9f9;
        }
        .schedule-header {
            background-color: #1a472a;
            color: #ffffff;
            padding: 12px 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .schedule-body {
            padding: 20px;
        }
        .detail-row {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #1a472a;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 5px;
        }
        .value {
            color: #2a2a2a;
            font-size: 14px;
            margin-top: 5px;
            line-height: 1.6;
        }
        .notice-box {
            margin: 30px 0;
            padding: 20px;
            background-color: #fff8e6;
            border-left: 5px solid #ffb300;
        }
        .notice-box p {
            margin: 0;
            font-size: 13px;
            line-height: 1.7;
        }
        .notice-box strong {
            color: #1a472a;
            font-size: 14px;
        }
        .closing {
            margin-top: 40px;
            font-size: 14px;
        }
        .signature {
            margin-top: 30px;
            font-size: 14px;
        }
        .signature-line {
            margin-bottom: 5px;
        }
        .footer {
            background-color: #2a2a2a;
            color: #cccccc;
            padding: 20px 35px;
            font-size: 11px;
            line-height: 1.6;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer-divider {
            border-top: 1px solid #444444;
            margin: 10px 0;
        }
        .confidential {
            color: #999999;
            font-style: italic;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="letterhead">
            <h1>GarbCollect</h1>
            <p>Official Communication</p>
        </div>
        
        <div class="content">
            <div class="document-title">
                <h2>Collection Schedule Assignment</h2>
            </div>

            <div class="greeting">
                <p>Dear <strong>{{ $driverName }}</strong>,</p>
            </div>
            
            <div class="body-text">
                <p>This is to officially notify you that you have been assigned to a garbage collection schedule. Please review the assignment details provided below and ensure compliance with all scheduled requirements.</p>
            </div>
            
            <div class="schedule-details">
                <div class="schedule-header">
                    Schedule Assignment Details
                </div>
                <div class="schedule-body">
                    <div class="detail-row">
                        <div class="label">Assigned Barangay</div>
                        <div class="value">{{ $barangay }}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="label">Collection Date</div>
                        <div class="value">{{ date('l, F d, Y', strtotime($collectionDate)) }}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="label">Collection Time</div>
                        <div class="value">{{ date('h:i A', strtotime($collectionTime)) }}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="label">Special Instructions</div>
                        <div class="value">{{ $notes }}</div>
                    </div>
                </div>
            </div>
            
            <div class="notice-box">
                <p><strong>IMPORTANT NOTICE:</strong> You are required to be present and ready for duty at the scheduled time and date. Failure to comply may result in administrative action. Should you have any concerns, conflicts, or require clarification regarding this assignment, please contact the administrative office immediately.</p>
            </div>
            
            <div class="closing">
                <p>Your dedication to maintaining clean and healthy communities is greatly appreciated. Thank you for your continued service to the public.</p>
            </div>
            
            <div class="signature">
                <p class="signature-line">Respectfully,</p>
                <p class="signature-line"><strong>GarbCollect</strong></p>
                <p class="signature-line">San Francisco Municipal Office</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>OFFICIAL GOVERNMENT COMMUNICATION</strong></p>
            <div class="footer-divider"></div>
            <p>This is an automatically generated official notification. Please do not reply to this email address.</p>
            <p>For inquiries, please contact the Municipal Office during regular business hours.</p>
            <div class="footer-divider"></div>
            <p class="confidential">Confidential: This email and any attachments are intended solely for the use of the individual to whom it is addressed.</p>
            <p>&copy; {{ date('Y') }} GarbCollect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
