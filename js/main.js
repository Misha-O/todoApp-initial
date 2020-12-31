const input = document.getElementById("todo");
const todoList = document.getElementById("task-list");
const todoListCompleted = document.getElementById("task-list-completed");
const addBtn = document.getElementById("addBtn");
const completedList = document.getElementById("completed-list");
const clearBtn = document.getElementById("clearBtn");
const editBtn = document.getElementById("editBtn");
const form = document.getElementById("form");
const dropFilter = document.getElementById("drop-filter");
// for drag & drop todos
const dropContainerLists = document.querySelectorAll(".task__list");
let draggableItem;

// drag & drop to remove
const dropZoneBin = document.getElementById("drop-zone");

let indexLi; //to check what li clicked to edit
let storage = localStorage;
let storageHistoryArray = []; //store data once reloaded
let storageContent = [];

// to filter and show proper lists
window.addEventListener("load", filterTodos);
storage.removeItem("randid"); //removes random localstorage key
// upload stored todos from storage
loadFromLocalStorage();

// add
addBtn.addEventListener("click", addItem);

// remove & complete
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove")) {
    removeDOMItem(e);
  }
  if (e.target.classList.contains("check")) {
    completeItem(e);
  }
});

// edit
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit")) {
    editItemInInput(e);
  }
});

// drag & drop todos

window.addEventListener("dragstart", (e) => {
  draggableItem = e.target;
  draggableItem.classList.add("dragged");
});

window.addEventListener("dragend", (e) => {
  draggableItem = e.target;
  draggableItem.classList.remove("dragged");
});

dropContainerLists.forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    // let testElem = document.elementFromPoint(e.clientY, e.clientX);
    // console.log("draggedOverElemtest: ", testElem);
    const draggedElem = document.querySelector(".dragged");

    const draggedOverElem = getElemDraggedOver(container, e.clientY);
    // console.log("draggedOverElem:  ", draggedOverElem);
    if (draggedOverElem === null) {
      container.appendChild(draggedElem);
    } else {
      container.insertBefore(draggedElem, draggedOverElem);
    }
  });
});

//drop bin
dropZoneBin.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggedElem = document.querySelector(".dragged");
  dropZoneBin.addEventListener("drop", (e) => {
    dropZoneBin.appendChild(draggedElem);
    dropZoneBin.removeChild(draggedElem);
  });
});

// clear all completed todos
clearBtn.addEventListener("click", (e) => {
  const completedItems = document.querySelectorAll(".completed");
  completedItems.forEach((completedItem) => {
    completedItem.parentNode.removeChild(completedItem);
  });
  clearCompleteTasks(e);
});

editBtn.addEventListener("click", (e) => {
  indexLi.innerHTML = `${input.value.trim()} <div class="instruments"><i class="fas fa-trash-alt remove icon"></i>  <i class="fas fa-pencil-alt edit icon"></i>  <i class="fas fa-check check icon"></i></div>`;

  if (input.value) {
    input.value = "";
  }
});

dropFilter.addEventListener("change", filterTodos);

// functions
function addItem(e) {
  if (input.value !== "") {
    createFragment(todoList);
    saveToLocalStorage();
    input.focus();
    input.value = "";
  }
}

function completeItem(e) {
  const classCheck = "check";
  const classCompleted = "completed";
  if (e.target.classList.contains(classCheck)) {
    const elemParent = e.target.closest(".task__item");
    if (!elemParent.classList.contains(classCompleted)) {
      elemParent.classList.add(classCompleted);
      todoListCompleted.appendChild(elemParent);
    } else {
      elemParent.classList.remove(classCompleted);
      todoList.appendChild(elemParent);
      todoListCompleted.removeChild(elemParent);
    }
  }
}

function removeDOMItem(e) {
  const liParent = e.target.closest(".task__item");
  liParent.parentNode.removeChild(liParent);
}

// clear completed from DOM and local Storage
// need to get from storage, find needed value and remove
function clearCompleteTasks(e) {
  if (storage.getItem("todo") !== typeof null) {
    storage.removeItem("todo");
  }
}

function editItemInInput(e) {
  const items = [...document.querySelectorAll(".task__item")];
  const elemParent = e.target.closest(".task__item");
  for (const item of items) {
    let index = items.findIndex((item) => item === elemParent);
    input.value = items[index].textContent.trim();
    indexLi = items[index];
  }
}

// creates HTML fragment
function createFragment(parentEl) {
  const fragment = document.createDocumentFragment();

  const li = document.createElement("li");
  li.classList.add("task__item");
  li.setAttribute("draggable", "true");
  li.setAttribute("id", "task-item");

  li.innerHTML = `${input.value.trim()} <div class="instruments"><i class="fas fa-trash-alt remove icon"></i>  <i class="fas fa-pencil-alt edit icon"></i>  <i class="fas fa-check check icon"></i></div>`;

  fragment.appendChild(li);
  parentEl.appendChild(fragment);
}

// save to local storage
function saveToLocalStorage() {
  storageHistoryArray.push({
    inputVal: input.value,
  });

  storage.setItem("todo", JSON.stringify(storageHistoryArray));
}

function loadFromLocalStorage() {
  storageContent = storage.getItem("todo");
  const data = JSON.parse(storageContent) || {};

  if (Object.keys(data).length !== 0) {
    data.forEach((element) => {
      const fragment = document.createDocumentFragment();

      const li = document.createElement("li");
      li.classList.add("task__item");
      li.setAttribute("draggable", "true");
      li.setAttribute("id", "task-item");

      li.innerHTML = `${element.inputVal} <div class="instruments"><i class="fas fa-trash-alt remove icon"></i>  <i class="fas fa-pencil-alt edit icon"></i>  <i class="fas fa-check check icon"></i></div>`;

      fragment.appendChild(li);
      todoList.appendChild(fragment);
    });
  }
}

// form
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

// create filter to show completed todos
function filterTodos(e) {
  const listVal = e.target.value;
  switch (listVal) {
    case "all":
      todoList.classList.remove("hidden");
      todoListCompleted.classList.remove("hidden");
      break;
    case "completed":
      todoListCompleted.classList.remove("hidden");
      todoList.classList.add("hidden");
      break;
  }
}

// drag & drop todos
function getElemDraggedOver(container, mousePosition) {
  // determine all elements inside container we are hovering over
  const itemsInside = [
    ...container.querySelectorAll(".task__item:not(.dragged)"),
  ];
  // loop through elems to determine which elem mousePosition is over
  return itemsInside.reduce(
    (closestElem, containerChild) => {
      const box = containerChild.getBoundingClientRect();

      // distance from top to mouse cursor inside containerChild
      // from vport top - till box top - half box height
      const offset = mousePosition - box.top - box.height / 2;
      // when below elem: positive; above: negative
      // console.log("offset", offset);
      if (offset < 0 && offset > closestElem.offset) {
        return {
          offset: offset,
          child: containerChild,
        };
      } else {
        return closestElem;
      }
      // which elem directly after mouse cursor
      // get offset Y to container for closest and the one directly below
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).child;
}
