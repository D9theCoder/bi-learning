<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Achievement extends Model
{
    /** @use HasFactory<\Database\Factories\AchievementFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'rarity',
        'criteria',
        'xp_reward',
        // 'category', // ! New field: Category of the achievement
        // 'target',   // ! New field: Target value to reach (e.g., 100 for "Read 100 books")
    ];

    protected function casts(): array
    {
        return [
            'rarity' => 'string',
            'xp_reward' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withTimestamps()
            ->withPivot('earned_at' /*, 'progress' */);
    }
}
