<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Get recent activities for admin dashboard
     */
    public function recent($limit = 10)
    {
        $activities = Activity::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user' => [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                        'avatar' => strtoupper(substr($activity->user->name, 0, 1)),
                    ],
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'timeAgo' => $this->formatTimeAgo($activity->created_at),
                    'created_at' => $activity->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'activities' => $activities,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Format time ago in French
     */
    private function formatTimeAgo($timestamp)
    {
        $now = now();
        $diff = $now->diffInSeconds($timestamp);

        if ($diff < 60) {
            return 'À l\'instant';
        } elseif ($diff < 3600) {
            $minutes = $now->diffInMinutes($timestamp);
            return "Il y a {$minutes} min" . ($minutes > 1 ? 's' : '');
        } elseif ($diff < 86400) {
            $hours = $now->diffInHours($timestamp);
            return "Il y a {$hours}h";
        } elseif ($diff < 604800) {
            $days = $now->diffInDays($timestamp);
            return "Il y a {$days} jour" . ($days > 1 ? 's' : '');
        } else {
            return $timestamp->format('d/m/Y');
        }
    }

    /**
     * Get activities for specific user
     */
    public function userActivities($userId, $limit = 20)
    {
        $activities = Activity::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'timeAgo' => $this->formatTimeAgo($activity->created_at),
                    'created_at' => $activity->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'activities' => $activities,
        ])->header('Access-Control-Allow-Origin', '*');
    }
}
