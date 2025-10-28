import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Flame, Star, Target, Trophy } from 'lucide-react';

interface WelcomeProps {
  canRegister?: boolean;
  userCount?: number;
}

export default function Welcome({
  canRegister = true,
  userCount = 0,
}: WelcomeProps) {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>
      <div className="relative flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>

        <header className="relative z-10 mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
          <nav className="flex items-center justify-end gap-4">
            {auth.user ? (
              <Link
                href={dashboard()}
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={login()}
                  className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                >
                  Log in
                </Link>
                {canRegister && (
                  <Link
                    href={register()}
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                  >
                    Register
                  </Link>
                )}
              </>
            )}
          </nav>
        </header>
        <div className="relative z-20 flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="w-full">
            {/* Hero Section */}
            <section className="mx-auto max-w-6xl px-4 py-12 text-center lg:py-20">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <Badge
                  variant="secondary"
                  className="border-0 bg-transparent p-0 text-sm font-medium"
                >
                  Join {userCount} learners worldwide
                </Badge>
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-gray-100">
                Learn Smarter,
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Achieve Faster
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-400">
                Experience the future of learning with one-on-one tutoring,
                gamified challenges, and personalized achievement tracking.
                Master any skill while having fun.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl"
                >
                  <Link href={register()}>
                    Start Learning Now
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  One-time payment
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </section>

            {/* Feature Highlights */}
            <section className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24 dark:from-gray-900 dark:to-gray-950">
              <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
                    Why Choose Bi-Learning?
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    A new approach to online learning that keeps you motivated
                    and engaged
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Feature 1 */}
                  <Card className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Gamified Learning
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-gray-600 dark:text-gray-400">
                        Earn XP, unlock achievements, and climb leaderboards as
                        you master new skills. Learning has never been this
                        addictive.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  {/* Feature 2 */}
                  <Card className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        One-on-One Tutors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-gray-600 dark:text-gray-400">
                        Get personalized guidance from expert tutors who adapt
                        to your learning style and pace. Real humans, real
                        results.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  {/* Feature 3 */}
                  <Card className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg">
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Daily Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-gray-600 dark:text-gray-400">
                        Build consistency with bite-sized daily tasks. Maintain
                        your streak, earn rewards, and watch your skills
                        compound.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Interactive Achievement Section */}
            <section className="py-16 lg:py-24">
              <div className="mx-auto max-w-6xl px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Achievements & Rewards
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
                      Track Your Progress,
                      <br />
                      Celebrate Your Wins
                    </h2>
                    <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                      Every lesson completed, every challenge conquered, and
                      every streak maintained earns you rewards. Watch your
                      profile light up with badges and achievements as you
                      progress.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <svg
                            className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                            Daily Streak Rewards
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Keep your learning momentum going and unlock
                            exclusive bonuses
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                            Level Up System
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Gain XP and advance through skill levels with each
                            completed lesson
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <svg
                            className="h-5 w-5 text-purple-600 dark:text-purple-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                            Exclusive Badges
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Collect rare achievements for mastering skills and
                            hitting milestones
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Your Learning Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Daily Streak
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              <Flame className="h-4 w-4" />
                              14 days
                            </span>
                          </div>
                          <Progress value={70} className="h-3" />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Course Progress
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              42 / 60 lessons
                            </span>
                          </div>
                          <Progress value={70} className="h-3" />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              XP to Next Level
                            </span>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              850 / 1000 XP
                            </span>
                          </div>
                          <Progress value={85} className="h-3" />
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4">
                        <Card className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                          <CardContent className="flex flex-col items-center gap-2 p-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/10">
                              <Trophy className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Champion
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                          <CardContent className="flex flex-col items-center gap-2 p-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/10">
                              <Star className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              All-Star
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                          <CardContent className="flex flex-col items-center gap-2 p-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/10">
                              <Target className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Focused
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24 dark:from-gray-950 dark:to-gray-900">
              <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
                    Loved by Learners Worldwide
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    See what our community has to say about their learning
                    journey
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <CardContent className="flex h-full flex-col p-0">
                      <div className="mb-4 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <CardDescription className="mb-4 grow text-gray-700 dark:text-gray-300">
                        "The gamification makes learning actually fun! I've
                        maintained a 30-day streak and learned more in a month
                        than I did in a year of traditional courses."
                      </CardDescription>
                      <div className="mt-auto flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-500 text-white">
                            SJ
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Sarah Johnson
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Marketing Manager
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <CardContent className="flex h-full flex-col p-0">
                      <div className="mb-4 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <CardDescription className="mb-4 grow text-gray-700 dark:text-gray-300">
                        "Having a personal tutor who understands my pace and
                        style has been game-changing. Best investment in my
                        career development."
                      </CardDescription>
                      <div className="mt-auto flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-500 text-white">
                            MC
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Michael Chen
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Software Developer
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <CardContent className="flex h-full flex-col p-0">
                      <div className="mb-4 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <CardDescription className="mb-4 grow text-gray-700 dark:text-gray-300">
                        "The achievement system keeps me motivated every single
                        day. I actually look forward to completing my daily
                        challenges!"
                      </CardDescription>
                      <div className="mt-auto flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-500 text-white">
                            ER
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Emma Rodriguez
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            UX Designer
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* CTA Footer Section */}
            <section className="py-16 lg:py-24">
              <div className="mx-auto max-w-4xl px-4">
                <div className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 shadow-2xl lg:p-16">
                  <div className="bg-grid-white/[0.05] pointer-events-none absolute inset-0 bg-[length:16px_16px]"></div>
                  <div className="relative z-10 text-center text-white">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                      Ready to Start Your Journey?
                    </h2>
                    <p className="mb-8 text-lg opacity-90 md:text-xl">
                      Join thousands of learners achieving their goals with
                      Bi-Learning.
                      <br />
                      Start your free trial today—no credit card required.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                      <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="bg-white text-emerald-600 shadow-xl hover:bg-gray-50 hover:shadow-2xl"
                      >
                        <Link href={register()}>
                          Get Started Free
                          <svg
                            className="ml-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      >
                        <Link href={login()}>Sign In</Link>
                      </Button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        One-time payment
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cancel anytime
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {userCount} active learners
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
        <div className="hidden h-14.5 lg:block"></div>
      </div>
    </>
  );
}
