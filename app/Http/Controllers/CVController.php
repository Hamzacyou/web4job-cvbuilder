<?php

namespace App\Http\Controllers;

use App\Models\CV;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CVController extends Controller
{
    /**
     * Create a new CV
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'template' => 'required|string|in:Moderne,Classique,Créatif,Minimaliste',
            'content' => 'nullable|array',
        ]);

        $user = Auth::user();
        
        // Create CV
        $cv = $user->cvs()->create($validated);

        // Increment cvs_created count for user
        $user->increment('cvs_created');

        // Log activity
        Activity::create([
            'user_id' => $user->id,
            'action' => 'create_cv',
            'description' => "Created new CV: {$cv->title}",
            'data' => [
                'cv_id' => $cv->id,
                'template' => $cv->template,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'CV created successfully',
            'cv' => $cv,
        ], 201)->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Export CV to PDF
     */
    public function exportPDF($cvId)
    {
        $user = Auth::user();
        $cv = CV::where('id', $cvId)->where('user_id', $user->id)->firstOrFail();

        // Increment pdf_exports
        $cv->increment('pdf_exports');
        $user->increment('pdf_exports');

        // Log activity
        Activity::create([
            'user_id' => $user->id,
            'action' => 'export_pdf',
            'description' => "Exported CV to PDF: {$cv->title}",
            'data' => [
                'cv_id' => $cv->id,
                'template' => $cv->template,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'PDF exported successfully',
            'cv' => $cv,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Get user's CVs
     */
    public function userCVs()
    {
        $user = Auth::user();
        $cvs = $user->cvs()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'cvs' => $cvs,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Get single CV
     */
    public function show($cvId)
    {
        $user = Auth::user();
        $cv = CV::where('id', $cvId)->where('user_id', $user->id)->firstOrFail();

        return response()->json([
            'success' => true,
            'cv' => $cv,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Update CV
     */
    public function update(Request $request, $cvId)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'template' => 'nullable|string|in:Moderne,Classique,Créatif,Minimaliste',
            'content' => 'nullable|array',
            'status' => 'nullable|string|in:draft,published',
        ]);

        $user = Auth::user();
        $cv = CV::where('id', $cvId)->where('user_id', $user->id)->firstOrFail();

        $cv->update($validated);

        // Log activity
        Activity::create([
            'user_id' => $user->id,
            'action' => 'update_cv',
            'description' => "Updated CV: {$cv->title}",
            'data' => ['cv_id' => $cv->id],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'CV updated successfully',
            'cv' => $cv,
        ])->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Delete CV
     */
    public function destroy($cvId)
    {
        $user = Auth::user();
        $cv = CV::where('id', $cvId)->where('user_id', $user->id)->firstOrFail();

        $cvTitle = $cv->title;
        $cv->delete();
        $user->decrement('cvs_created');

        // Log activity
        Activity::create([
            'user_id' => $user->id,
            'action' => 'delete_cv',
            'description' => "Deleted CV: {$cvTitle}",
            'data' => ['cv_id' => $cvId],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'CV deleted successfully',
        ])->header('Access-Control-Allow-Origin', '*');
    }
}
