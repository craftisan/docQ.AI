export default function HomePage() {
  return (
    <div className="h-screen w-screen grid grid-cols-2 gap-0 *:p-10">
      <div className="h-full flex justify-center items-center bg-blue-500 text-white">
        <h1 className="text-6xl font-bold text-center">Welcome to <br/>DocQ</h1>
      </div>
      <div className="h-full flex justify-center items-center bg-white text-black">
        <p className="text-lg">
          Please <a className="text-blue-500 underline" href="/register">Register</a> or <a className="text-blue-500 underline" href="/login">Login</a>.
        </p>
      </div>
    </div>
  );
}
