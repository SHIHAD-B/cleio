const image = document.getElementById('edit_image')
alert(image.src)
const cropper = new Cropper(image, {
    aspectRatio: 1 / 1,
    viewMode: 0
});

document.querySelector('#btn-crop').addEventListener('click', function () {
    var croppedImage = cropper.getCroppedCanvas().toDataURL('image/png');
    document.getElementById('previewImage').src = croppedImage;

})


