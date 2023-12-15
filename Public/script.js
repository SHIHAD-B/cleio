const image = document.getElementById('edit_image')
alert(image.src)
const cropper = new Cropper(image, {
    aspectRatio: 1 / 1,
    viewMode: 1
});

document.querySelector('#btn-crop').addEventListener('click', function () {
    const croppedImage = cropper.getCroppedCanvas({ width: 500, height: 500 }).toDataURL('image/png');
    document.getElementById('previewImage').src = croppedImage;
});

