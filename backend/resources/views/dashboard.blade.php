<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    @vite('resources/css/app.css')
</head>
<body class="min-h-screen bg-gray-100">

    <nav class="bg-white shadow p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">
            My App
        </h1>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                Logout
            </button>
        </form>
    </nav>

    <div class="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">

        <h2 class="text-2xl font-bold mb-4">
            Welcome 👋
        </h2>

        <div class="space-y-2 text-gray-700">
            <p><strong>Name:</strong> {{ auth()->user()->name }}</p>
            <p><strong>Email:</strong> {{ auth()->user()->email }}</p>
            <p><strong>Google ID:</strong> {{ auth()->user()->google_id }}</p>
        </div>

    </div>

</body>
</html>