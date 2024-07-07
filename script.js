// Configuration
const config = {
  mediaPath: "/media/",
  itemsPerPage: 50,
};

const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalVideo = document.getElementById("modalVideo");
const close = document.getElementsByClassName("close")[0];
const search = document.getElementById("search");
const itemsPerRow = document.getElementById("itemsPerRow");
const currentPathElement = document.getElementById("currentPath");
const backButton = document.getElementById("backButton");
const loadMoreButton = document.getElementById("loadMore");
const loader = document.querySelector(".loader");

let mediaFiles = [];
let currentPath = "";
let currentPage = 1;

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

async function getMediaFiles(dir = config.mediaPath) {
  showLoader();
  try {
    const response = await fetch(dir);
    const data = await response.json();
    let files = [];

    for (const item of data) {
      if (item.type === "directory") {
        files.push({
          name: item.name,
          path: `${dir}${item.name}/`.substring(config.mediaPath.length),
          type: "directory",
        });
      } else if (item.type === "file") {
        const ext = item.name.split(".").pop().toLowerCase();
        const type = ["jpg", "jpeg", "png", "gif"].includes(ext)
          ? "image"
          : ["mp4", "webm", "ogg", "mov"].includes(ext)
            ? "video"
            : "other";
        if (type !== "other") {
          files.push({
            name: item.name,
            path: `${dir}${item.name}`.substring(config.mediaPath.length),
            type: type,
          });
        }
      }
    }

    return files;
  } catch (error) {
    console.error("Error fetching media files:", error);
    return [];
  } finally {
    hideLoader();
  }
}

function createGalleryItem(file) {
  const item = document.createElement("div");
  item.className = "gallery-item";
  const content = document.createElement("div");
  content.className = "gallery-item-content";

  if (file.type === "directory") {
    const folderIcon = document.createElement("div");
    folderIcon.className = "folder-icon";
    folderIcon.textContent = "📁";
    content.appendChild(folderIcon);
  } else if (file.type === "image") {
    const img = document.createElement("img");
    img.src = `${config.mediaPath}${encodeURIComponent(file.path)}`;
    img.alt = file.name;
    content.appendChild(img);
  } else if (file.type === "video") {
    const video = document.createElement("video");
    video.src = `${config.mediaPath}${encodeURIComponent(file.path)}`;
    video.muted = true;
    content.appendChild(video);
  }
  item.appendChild(content);

  const info = document.createElement("div");
  info.className = "gallery-item-info";
  info.textContent = file.name;
  item.appendChild(info);

  item.addEventListener("click", () => {
    if (file.type === "directory") {
      navigateToDirectory(file.path);
    } else {
      openModal(file);
    }
  });

  return item;
}

function openModal(file) {
  modal.style.display = "block";
  if (file.type === "image") {
    modalImg.style.display = "block";
    modalVideo.style.display = "none";
    modalImg.src = `${config.mediaPath}${encodeURIComponent(file.path)}`;
  } else if (file.type === "video") {
    modalImg.style.display = "none";
    modalVideo.style.display = "block";
    modalVideo.src = `${config.mediaPath}${encodeURIComponent(file.path)}`;
    modalVideo.play();
  }
}

close.onclick = function () {
  modal.style.display = "none";
  modalVideo.pause();
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    modalVideo.pause();
  }
};

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    modal.style.display = "none";
    modalVideo.pause();
  }
});

function updateGallery() {
  const searchTerm = search.value.toLowerCase();
  const filteredFiles = mediaFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm),
  );

  const startIndex = (currentPage - 1) * config.itemsPerPage;
  const endIndex = startIndex + config.itemsPerPage;
  const filesToShow = filteredFiles.slice(startIndex, endIndex);

  gallery.innerHTML = "";
  filesToShow.forEach((file) => {
    const item = createGalleryItem(file);
    gallery.appendChild(item);
  });

  loadMoreButton.style.display =
    endIndex < filteredFiles.length ? "block" : "none";
}

function navigateToDirectory(path) {
  currentPath = path;
  currentPage = 1;
  currentPathElement.textContent = currentPath || "Root";
  backButton.style.display = currentPath ? "inline-block" : "none";

  getMediaFiles(config.mediaPath + currentPath).then((files) => {
    mediaFiles = files;
    updateGallery();
  });
}

search.addEventListener("input", () => {
  currentPage = 1;
  updateGallery();
});

itemsPerRow.addEventListener("change", function () {
  gallery.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
});

loadMoreButton.addEventListener("click", () => {
  currentPage++;
  updateGallery();
});

const breadcrumbsElement = document.getElementById("breadcrumbs");

function updateBreadcrumbs() {
  const paths = currentPath.split("/").filter((p) => p);
  let breadcrumbHTML = '<a href="#" data-path="">Root</a>';
  let currentFullPath = "";

  paths.forEach((path, index) => {
    currentFullPath += `${path}/`;
    breadcrumbHTML += ` > <a href="#" data-path="${currentFullPath}">${path}</a>`;
  });

  breadcrumbsElement.innerHTML = breadcrumbHTML;

  // Add event listeners to breadcrumb links
  breadcrumbsElement.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToDirectory(e.target.dataset.path);
    });
  });
}

function navigateToDirectory(path) {
  currentPath = path;
  currentPage = 1;
  updateBreadcrumbs();

  getMediaFiles(config.mediaPath + currentPath).then((files) => {
    mediaFiles = files;
    updateGallery();
  });
}

// Initialize the gallery
navigateToDirectory("");
