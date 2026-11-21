import React from "react";
import Image from "next/image";
import RegisterForm from "./RegisterForm";

function RegisterPage() {
  return (
    <section className="my-8 flex items-center justify-center px-4 min-h-[85vh]">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="relative size-20 rounded-[22px] p-1 border border-zinc-700/80 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-2xl ring-1 ring-white/10">
            <div className="relative w-full h-full rounded-[18px] overflow-hidden">
              <Image
                src="/logo-new.png"
                alt="SMM Lacost Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              <span className="text-gray-400">SMM</span> Lacost
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mt-0.5">
              Create Your Account
            </p>
          </div>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}

export default RegisterPage;
