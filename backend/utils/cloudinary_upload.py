import io
import os
import requests


def upload_file(file_bytes, filename, content_type):
    """Upload bytes to Cloudinary. Falls back to local URL if not configured."""
    cloudinary_url = os.environ.get('CLOUDINARY_URL', '')

    if not cloudinary_url or 'placeholder' in cloudinary_url:
        # Return a placeholder — Cloudinary not configured
        return f'/api/exports/local/{filename}'

    import cloudinary
    import cloudinary.uploader

    resource_type = 'raw'
    result = cloudinary.uploader.upload(
        io.BytesIO(file_bytes),
        public_id=filename.rsplit('.', 1)[0],
        resource_type=resource_type,
        format=filename.rsplit('.', 1)[-1],
    )
    return result.get('secure_url', '')
