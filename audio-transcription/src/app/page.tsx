import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-indigo-300 selection:text-white relative z-0">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-indigo-300/20 rounded-full blur-[120px] absolute -top-40 -left-20 animate-pulse mix-blend-multiply"></div>
        <div className="w-[600px] h-[600px] bg-rose-300/20 rounded-full blur-[100px] absolute bottom-20 right-0 animate-pulse animation-delay-2000 mix-blend-multiply"></div>
      </div>
      
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500 tracking-tight pb-2 drop-shadow-sm">
          EchoScribe
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
          Capture your thoughts beautifully. Speak into the void, and let the cloud capture your words.
        </p>
      </div>

      <AudioRecorder />
      
    </main>
  );
}
