
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    @vite('resources/css/app.css')
</head>
<body class="min-h-screen flex items-center justify-center bg-gray-100">

    <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h2 class="text-2xl font-bold text-center mb-6">
            Login
        </h2>

        {{-- Error Message --}}
        @if(session('error'))
            <div class="mb-4 p-3 bg-red-100 text-red-600 rounded">
                {{ session('error') }}
            </div>
        @endif

        {{-- Divider --}}
        <div class="my-6 flex items-center">
            <div class="flex-grow border-t"></div>
            <span class="mx-3 text-gray-400 text-sm">OR</span>
            <div class="flex-grow border-t"></div>
        </div>

        {{-- Login with Google --}}
        <a href="{{ route('google.login') }}"
           class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">

            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"/>
            </svg>

            Login with Google
        </a>

    </div>

</body>
</html>