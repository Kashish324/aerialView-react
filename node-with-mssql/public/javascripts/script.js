let arrow = document.querySelectorAll(".arrow");
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
let subMenuBtn = document.querySelectorAll(".sub-menu-arrow");

// console.log(sidebarBtn);


function showSubMenu() {
    for (var i = 0; i < arrow.length; i++) {
        arrow[i].addEventListener("click", (e) => {
            let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
            arrowParent.classList.toggle("showMenu");
        });
    }
}

showSubMenu()


function sidebarHandling() {
    sidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });
}

sidebarHandling()


function subMenusHandling() {
    for (var i = 0; i < subMenuBtn.length; i++) {
        subMenuBtn[i].addEventListener("click", (e) => {
            let subMenuBtnParent = e.target.parentElement.parentElement;//selecting main parent of arrow
            console.log(subMenuBtnParent)
            subMenuBtnParent.classList.toggle("showMenu");
        });
    }

    for (var j = 0; j < subMenuBtn.length; j++) {
        subMenuBtn[i].addEventListener("click", function (e) {
            let parent = e.target.parentElement.parentElement;
            parent.classList.toggle("showMenu")
        })
    }
}

subMenusHandling()

