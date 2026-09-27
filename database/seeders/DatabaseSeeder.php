<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'admin',
        ], [
            'name' => 'Administrateur',
            'password' => Hash::make('admin'),
            'status' => 'Actif',
            'cvs_created' => 0,
            'pdf_exports' => 0,
        ]);

        // Create 50 test users with realistic data
        User::factory()->count(50)->create();
    }
}
