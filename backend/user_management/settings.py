

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'default_secret_key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['k-to-drinks-management-system.onrender.com', '127.0.0.1', 'localhost']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # Add DRF
    'corsheaders',  # Add CORS headers once
    'users',  # Add your app
    'local_stores',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Keep this only once at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'https://k-to-drinks.netlify.app',  # Frontend URL
    'http://localhost:5173',  # Local development
    'http://localhost:3000',  # Frontend development URL
]


# CSRF settings for trusted origins
CSRF_TRUSTED_ORIGINS = [
    'https://k-to-drinks-management-system.onrender.com', # Backend URL
    "http://127.0.0.1:8000" # Local development
]

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'user_management.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'user_management.wsgi.application'


# Static Files for Vite
VITE_BUILD_DIR = os.path.join(BASE_DIR, 'frontend', 'dist')
STATIC_URL = 'static/'
STATICFILES_DIRS = [VITE_BUILD_DIR]

# Database Configuration
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',  # Use PostgreSQL in production
#         'NAME': os.getenv('DB_NAME', 'default_db_name'),
#         'USER': os.getenv('DB_USER', 'default_db_user'),
#         'PASSWORD': os.getenv('DB_PASSWORD', 'default_db_password'),
#         'HOST': os.getenv('DB_HOST', 'localhost'),  # Use 'localhost' for local or specific host URL for production
#         'PORT': os.getenv('DB_PORT', '5432'),  # Default PostgreSQL port
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Password validation (optional, uncomment to use)
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
