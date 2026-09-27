<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private function corsHeaders()
    {
        return [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept'
        ];
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $stats = [
            'totalUsers' => User::count(),
            'cvsCreated' => User::sum('cvs_created') ?? 0,
            'pdfExports' => User::sum('pdf_exports') ?? 0,
            'revenue' => User::whereNotNull('subscription_end_date')->sum('subscription_price') ?? 0
        ];

        return response()->json($stats)->withHeaders($this->corsHeaders());
    }

    /**
     * Get recent users
     */
    public function getRecentUsers()
    {
        $users = User::select('id', 'name', 'email', 'status', 'created_at', 'cvs_created')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => ucfirst($user->status ?? 'Inactif'),
                    'joinDate' => $this->formatDate($user->created_at),
                    'cvsCreated' => $user->cvs_created ?? 0
                ];
            });

        return response()->json($users)->withHeaders($this->corsHeaders());
    }

    /**
     * Get registration activity data for the last 12 months
     */
    public function getRegistrationActivity()
    {
        $data = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i)->startOfMonth();
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $data[] = $count;
        }

        return response()->json($data)->withHeaders($this->corsHeaders());
    }

    /**
     * Get template usage statistics
     */
    public function getTemplateUsage()
    {
        $templates = [
            ['name' => 'Moderne', 'percentage' => 45, 'color' => '#1f2937'],
            ['name' => 'Classique', 'percentage' => 30, 'color' => '#374151'],
            ['name' => 'Créatif', 'percentage' => 15, 'color' => '#3b82f6'],
            ['name' => 'Minimaliste', 'percentage' => 10, 'color' => '#9ca3af']
        ];

        return response()->json($templates)->withHeaders($this->corsHeaders());
    }

    /**
     * Get all dashboard data at once
     */
    public function getAllDashboardData()
    {
        $allData = [
            'stats' => [
                'totalUsers' => User::count(),
                'cvsCreated' => User::sum('cvs_created') ?? 0,
                'pdfExports' => User::sum('pdf_exports') ?? 0,
                'revenue' => User::whereNotNull('subscription_end_date')->sum('subscription_price') ?? 0
            ],
            'users' => User::select('id', 'name', 'email', 'status', 'created_at', 'cvs_created')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => ucfirst($user->status ?? 'Inactif'),
                        'joinDate' => $this->formatDate($user->created_at),
                        'cvsCreated' => $user->cvs_created ?? 0
                    ];
                }),
            'registrationData' => $this->getRegistrationDataArray(),
            'templateUsage' => [
                ['name' => 'Moderne', 'percentage' => 45, 'color' => '#1f2937'],
                ['name' => 'Classique', 'percentage' => 30, 'color' => '#374151'],
                ['name' => 'Créatif', 'percentage' => 15, 'color' => '#3b82f6'],
                ['name' => 'Minimaliste', 'percentage' => 10, 'color' => '#9ca3af']
            ]
        ];

        return response()->json($allData)->withHeaders($this->corsHeaders());
    }

    /**
     * Get registration data as array
     */
    private function getRegistrationDataArray()
    {
        $data = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i)->startOfMonth();
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $data[] = $count;
        }

        return $data;
    }

    /**
     * Format date for display
     */
    private function formatDate($date)
    {
        $now = now();
        $diffInDays = $date->diffInDays($now);
        $diffInHours = $date->diffInHours($now);
        $diffInMinutes = $date->diffInMinutes($now);

        if ($diffInMinutes < 60) {
            return 'À l\'instant';
        } elseif ($diffInHours < 24) {
            return 'Il y a ' . $diffInHours . ' heure' . ($diffInHours > 1 ? 's' : '');
        } elseif ($diffInDays == 0) {
            return 'Aujourd\'hui, ' . $date->format('H:i');
        } elseif ($diffInDays == 1) {
            return 'Hier, ' . $date->format('H:i');
        } elseif ($diffInDays < 7) {
            return 'Il y a ' . $diffInDays . ' jours';
        } else {
            return $date->format('d/m/Y');
        }
    }
}
