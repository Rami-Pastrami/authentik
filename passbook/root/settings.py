"""
Django settings for passbook project.

Generated by 'django-admin startproject' using Django 2.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import importlib
import logging
import os
import sys

import structlog
from sentry_sdk import init as sentry_init
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

from passbook import __version__
from passbook.lib.config import CONFIG
from passbook.lib.sentry import before_send

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_ROOT = BASE_DIR + '/static'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = CONFIG.y('secret_key',
                      "9$@r!d^1^jrn#fk#1#@ks#9&i$^s#1)_13%$rwjrhd=e8jfi_s")  # noqa Debug

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = CONFIG.y_bool('debug')
INTERNAL_IPS = ['127.0.0.1']
# ALLOWED_HOSTS = CONFIG.y('domains', []) + [CONFIG.y('primary_domain')]
ALLOWED_HOSTS = ['*']
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

LOGIN_URL = 'passbook_core:auth-login'
# CSRF_FAILURE_VIEW = 'passbook.core.views.errors.CSRFErrorView.as_view'

# Custom user model
AUTH_USER_MODEL = 'passbook_core.User'

CSRF_COOKIE_NAME = 'passbook_csrf'
SESSION_COOKIE_NAME = 'passbook_session'
SESSION_COOKIE_DOMAIN = CONFIG.y('primary_domain')
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
LANGUAGE_COOKIE_NAME = 'passbook_language'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    # 'rest_framework',
    # 'drf_yasg',
    'passbook.core.apps.PassbookCoreConfig',
    'passbook.admin.apps.PassbookAdminConfig',
    'passbook.api.apps.PassbookAPIConfig',
    'passbook.audit.apps.PassbookAuditConfig',
    'passbook.lib.apps.PassbookLibConfig',
    'passbook.ldap.apps.PassbookLdapConfig',
    'passbook.oauth_client.apps.PassbookOAuthClientConfig',
    'passbook.oauth_provider.apps.PassbookOAuthProviderConfig',
    'passbook.oidc_provider.apps.PassbookOIDCProviderConfig',
    'passbook.saml_idp.apps.PassbookSAMLIDPConfig',
    'passbook.otp.apps.PassbookOTPConfig',
    'passbook.captcha_factor.apps.PassbookCaptchaFactorConfig',
    'passbook.hibp_policy.apps.PassbookHIBPConfig',
    'passbook.pretend.apps.PassbookPretendConfig',
    'passbook.password_expiry_policy.apps.PassbookPasswordExpiryPolicyConfig',
    'passbook.suspicious_policy.apps.PassbookSuspiciousPolicyConfig',
    'passbook.app_gw.apps.PassbookApplicationApplicationGatewayConfig',
]

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ]
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{CONFIG.y('redis.host')}:6379/{CONFIG.y('redis.cache_db')}",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
DJANGO_REDIS_IGNORE_EXCEPTIONS = True
DJANGO_REDIS_LOG_IGNORED_EXCEPTIONS = True
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'passbook.root.urls'

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

WSGI_APPLICATION = 'passbook.root.wsgi.application'

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': CONFIG.y('postgresql.host'),
        'NAME': CONFIG.y('postgresql.name'),
        'USER': CONFIG.y('postgresql.user'),
        'PASSWORD': CONFIG.y('postgresql.password'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Celery settings
# Add a 10 minute timeout to all Celery tasks.
CELERY_TASK_SOFT_TIME_LIMIT = 600
CELERY_BEAT_SCHEDULE = {}
CELERY_CREATE_MISSING_QUEUES = True
CELERY_TASK_DEFAULT_QUEUE = 'passbook'
CELERY_BROKER_URL = (f"redis://:{CONFIG.y('redis.password')}@{CONFIG.y('redis.host')}"
                     f":6379/{CONFIG.y('redis.message_queue_db')}")
CELERY_RESULT_BACKEND = (f"redis://:{CONFIG.y('redis.password')}@{CONFIG.y('redis.host')}"
                         f":6379/{CONFIG.y('redis.message_queue_db')}")


if not DEBUG:
    sentry_init(
        dsn="https://33cdbcb23f8b436dbe0ee06847410b67@sentry.beryju.org/3",
        integrations=[
            DjangoIntegration(),
            CeleryIntegration()
        ],
        send_default_pii=True,
        before_send=before_send,
        release='passbook@%s' % __version__
    )

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'


structlog.configure_once(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(),
        structlog.processors.StackInfoRenderer(),
        # structlog.processors.format_exc_info,
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    context_class=structlog.threadlocal.wrap_dict(dict),
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

LOG_PRE_CHAIN = [
    # Add the log level and a timestamp to the event_dict if the log entry
    # is not from structlog.
    structlog.stdlib.add_log_level,
    structlog.processors.TimeStamper(),
]

with CONFIG.cd('log'):
    LOGGING_HANDLER_MAP = {
        'passbook': 'DEBUG',
        'django': 'WARNING',
        'celery': 'WARNING',
        'grpc': 'DEBUG',
        'oauthlib': 'DEBUG',
        'oauth2_provider': 'DEBUG',
        'daphne': 'INFO',
    }
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            "plain": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.processors.JSONRenderer(),
                "foreign_pre_chain": LOG_PRE_CHAIN,
            },
            "colored": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.dev.ConsoleRenderer(colors=DEBUG),
                "foreign_pre_chain": LOG_PRE_CHAIN,
            },
        },
        'handlers': {
            'console': {
                'level': DEBUG,
                'class': 'logging.StreamHandler',
                'formatter': "colored" if DEBUG else "plain",
            },
            'queue': {
                'level': DEBUG,
                'class': 'passbook.lib.log.QueueListenerHandler',
                'handlers': [
                    'cfg://handlers.console',
                ],
            }
        },
        'loggers': {
        }
    }
    for handler_name, level in LOGGING_HANDLER_MAP.items():
        LOGGING['loggers'][handler_name] = {
            'handlers': ['console'],
            'level': level,
            'propagate': True,
        }

TEST = False
TEST_RUNNER = 'xmlrunner.extra.djangotestrunner.XMLTestRunner'
TEST_OUTPUT_VERBOSE = 2

TEST_OUTPUT_FILE_NAME = 'unittest.xml'

if any('test' in arg for arg in sys.argv):
    LOGGING = None
    TEST = True
    CELERY_TASK_ALWAYS_EAGER = True


_DISALLOWED_ITEMS = ['INSTALLED_APPS', 'MIDDLEWARE', 'AUTHENTICATION_BACKENDS']
# Load subapps's INSTALLED_APPS
for _app in INSTALLED_APPS:
    if _app.startswith('passbook') and \
            not _app.startswith('passbook.core'):
        if 'apps' in _app:
            _app = '.'.join(_app.split('.')[:-2])
        try:
            app_settings = importlib.import_module("%s.settings" % _app)
            INSTALLED_APPS.extend(getattr(app_settings, 'INSTALLED_APPS', []))
            MIDDLEWARE.extend(getattr(app_settings, 'MIDDLEWARE', []))
            AUTHENTICATION_BACKENDS.extend(getattr(app_settings, 'AUTHENTICATION_BACKENDS', []))
            for _attr in dir(app_settings):
                if not _attr.startswith('__') and _attr not in _DISALLOWED_ITEMS:
                    globals()[_attr] = getattr(app_settings, _attr)
        except ImportError:
            pass

if DEBUG:
    INSTALLED_APPS.append('debug_toolbar')
    MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')
