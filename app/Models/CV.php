<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CV extends Model
{
    protected $table = 'cvs';

    protected $fillable = [
        'user_id',
        'title',
        'template',
        'content',
        'status',
        'pdf_exports',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
