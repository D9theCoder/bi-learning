<?php

use App\Models\AssessmentQuestion;
use Tests\TestCase;

uses(TestCase::class);

it('converts essay questions correctly', function () {
    $question = AssessmentQuestion::factory()->create([
        'type' => 'essay',
        'answer_config' => null,
    ]);

    $this->artisan('assessment-questions:backfill-answer-config')->assertExitCode(0);

    $question->refresh();

    expect($question->answer_config)->toBe(['type' => 'essay']);
});

it('dry run does not modify database', function () {
    $question = AssessmentQuestion::factory()->create([
        'type' => 'essay',
        'answer_config' => null,
    ]);

    $this->artisan('assessment-questions:backfill-answer-config --dry-run')->assertExitCode(0);

    $question->refresh();
    expect($question->getRawOriginal('answer_config'))->toBeNull();
});

it('skips non-essay questions with missing answer_config', function () {
    $question = AssessmentQuestion::factory()->create([
        'type' => 'multiple_choice',
        'answer_config' => null,
    ]);

    $this->artisan('assessment-questions:backfill-answer-config')->assertExitCode(0);

    $question->refresh();
    expect($question->getRawOriginal('answer_config'))->toBeNull();
});
