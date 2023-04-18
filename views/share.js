function openModal(id) {
    var img = document.getElementById(id);
    var modalImg = document.getElementById("img01");
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
    modalImg.src = img.src;
}
function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}