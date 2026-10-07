import { getCurrentUser } from '@/lib/auth';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignupForm from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect('/dashboard');

  return (
    <section className="relative overflow-hidden py-28">
      <div className="wrapper">
        <div className="relative mx-auto max-w-[600px]">
          <div className="contact-wrapper relative z-30 border border-gray-100 bg-white p-8 dark:border-dark-primary dark:bg-dark-primary sm:p-14">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white/90">
                Sign Up
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create your free account - 50 welcome credits included.
              </p>
            </div>

            <SignupForm />

            <div className="mt-5">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="text-sm font-semibold text-primary-500"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-32 left-1/2 z-0 -translate-x-1/2">
        <svg
          width="930"
          height="760"
          viewBox="0 0 930 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g opacity="0.3" filter="url(#signupGlowA)">
            <circle cx="380.335" cy="380.335" r="179.665" fill="#38a8f0" />
          </g>
          <g opacity="0.55" filter="url(#signupGlowB)">
            <circle cx="549.665" cy="380.335" r="179.665" fill="#2f7ef8" />
          </g>
          <defs>
            <filter
              id="signupGlowA"
              x="0.669922"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur stdDeviation="100" result="blurA" />
            </filter>
            <filter
              id="signupGlowB"
              x="170"
              y="0.6698"
              width="759.33"
              height="759.33"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur stdDeviation="100" result="blurB" />
            </filter>
          </defs>
        </svg>
      </span>
    </section>
  );
}
