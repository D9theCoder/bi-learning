# Quiz System Fixes Implementation Plan

Fix fill-in-the-blank answer validation, add student answer review, and improve teacher scoring tab.

---

## Proposed Changes

### Feature 1: Fill-in-the-Blank Optional Answer Bug

The backend `calculateAttemptScore()` in [QuizController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L38-100>) correctly checks all optional answers stored in `options` array. However, the frontend `computeAutoPoints()` function only checks `correct_answer`.

#### [MODIFY] [quiz-grading-student-row.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/quiz-grading-student-row.tsx>)

Update `computeAutoPoints()` function to match backend logic:

```typescript
function computeAutoPoints(
  question: AssessmentQuestion,
  answer: unknown
): number {
  if (answer === null || answer === undefined || String(answer) === "") {
    return 0;
  }

  if (question.type === "multiple_choice") {
    return String(answer) === String(question.correct_answer ?? "")
      ? question.points
      : 0;
  }

  if (question.type === "fill_blank") {
    const normalizedAnswer = normalizeFillBlank(answer);

    // Build list of all valid answers (correct_answer + options)
    const correctAnswers: string[] = [];
    if (question.correct_answer) {
      correctAnswers.push(normalizeFillBlank(question.correct_answer));
    }
    if (Array.isArray(question.options)) {
      question.options.forEach((opt) => {
        if (opt) correctAnswers.push(normalizeFillBlank(opt));
      });
    }

    return correctAnswers.includes(normalizedAnswer) ? question.points : 0;
  }

  return 0;
}
```

---

### Feature 2: Student Answer Review (Practice/Quiz Only)

Allow students to view their answers after completing a practice or quiz assessment. Final exams are excluded.

#### [NEW] [quiz-answer-review-dialog.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/quiz/quiz-answer-review-dialog.tsx>)

Create a dialog component that shows:

- Each question with the student's answer
- Whether answer was correct/incorrect (for multiple choice and fill_blank)
- The correct answer (for non-essay questions)
- Points awarded per question

#### [MODIFY] [my-scores-card.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/my-scores-card.tsx>)

- Add "View Answers" button next to completed practice/quiz submissions
- Only show for `type === 'practice' || type === 'quiz'` (not `final_exam`)
- Opens `QuizAnswerReviewDialog` with attempt data

#### [MODIFY] [CourseController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/CourseController.php>)

Update scoring tab props to include:

- Attempt answers for each submission
- Question details for each assessment

---

### Feature 3: Teacher Scoring Tab Improvements

#### 3a. Show All Student Attempts

#### [MODIFY] [quiz-grading-assessment-card.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/quiz-grading-assessment-card.tsx>)

Currently only shows one attempt per student. Change to:

- Filter all attempts for the assessment per student
- Show each attempt as an expandable row with date/score
- Display "No attempts yet" if student has none

#### 3b. Show Preliminary Score

Already displays score in `QuizGradingStudentRow`, but need to ensure it's labeled as "preliminary" for ungraded attempts.

#### 3c. Fill-in-Blank Show All Optional Answers

#### [MODIFY] [quiz-grading-student-row.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/quiz-grading-student-row.tsx#L221-231>)

For fill_blank questions, update the "Answer key" display to show all valid answers:

```tsx
{
  question.type === "fill_blank" && (
    <>
      <span>•</span>
      <span>
        Valid answers:{" "}
        {[question.correct_answer, ...(question.options ?? [])]
          .filter(Boolean)
          .join(", ")}
      </span>
    </>
  );
}
```

#### 3d. Multiple Choice Show Text Instead of Index

#### [MODIFY] [quiz-grading-student-row.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/quiz-grading-student-row.tsx>)

For multiple choice questions:

- Show actual option text for student answer: `question.options?.[Number(answer)]`
- Show actual option text for answer key: `question.options?.[Number(question.correct_answer)]`

---

## Verification Plan

### Automated Tests

Run existing quiz tests:

```bash
php artisan test tests/Feature/QuizTest.php
```

Add new test for fill_blank with optional answers:

```php
it('auto-grades fill in the blank questions with optional answers', function () {
    // Create question with correct_answer='Paris' and options=['paris', 'City of Paris']
    // Submit with 'City of Paris' and verify score is awarded
});
```

Run after adding:

```bash
php artisan test --filter="auto-grades fill in the blank questions with optional answers"
```

### Manual Verification

**For Fill-in-Blank Bug:**

1. Create a quiz with a fill_blank question having `correct_answer: "Paris"` and `options: ["city of lights", "Paris, France"]`
2. As student, answer with "city of lights"
3. Verify the answer is marked as correct in both submission and teacher grading view

**For Answer Review:**

1. Complete a practice quiz as student
2. Go to Scoring tab and verify "View Answers" button appears
3. Click button and verify dialog shows questions, answers, and correctness
4. Complete a final exam and verify "View Answers" does NOT appear

**For Scoring Tab Improvements:**

1. As tutor, go to a course's Scoring tab
2. Verify each student shows all their attempts (not just one)
3. Expand a student row and verify:
   - Fill_blank questions show all valid answers in the answer key
   - Multiple choice shows actual text (e.g., "Option A text") instead of index (e.g., "0")
