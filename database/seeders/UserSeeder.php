<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'roles' => 'admin',
            'name' => 'Den',
            'middlename' => 'B',
            'lastname' => 'Rivera',
            'phone_num' => '09946801083',
            'email' => 'den@gmail.com',
            'is_active' => 'yes',
            'password' => '$2y$12$GtzXW1y1B0VVWkWLn7KYS.ZgtvrTU//CT1qPVvdHYzC3wGCw2G2KC',
        ]);
    }
}
