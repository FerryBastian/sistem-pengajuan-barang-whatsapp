<!-- Untuk Blade template -->
<a href="{{ route('google.login') }}" class="btn btn-danger">
    <i class="fab fa-google"></i> Login with Google
</a>

<!-- Atau dengan Tailwind CSS -->
<a href="{{ route('google.login') }}" 
   class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <!-- Google logo SVG path -->
    </svg>
    Login with Google
</a>