// 變數區 ///////////////////////////////////////////////////////////////////////////////////////////
// 網址變數
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
// 分頁變數
const MOVIES_PER_PAGE = 12;
// 把下方API串到的電影資料放入這個陣列
const movies = [];
// 存放搜尋後的結果
let filteredMovies = [];
// 選取電影卡片區的DOM
const dataPanel = document.querySelector("#data-panel");
// 選取搜尋欄、輸入值
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// 選取分頁器
const paginator = document.querySelector("#paginator");
// 控制以card或list樣式渲染電影清單的flag
let flagOfDisplayForCardOrList = 0; // 0是card、1是list
// 選取icons-view
const iconsView = document.querySelector("#icons-view");
// 指定一個變數存取使用者目前頁碼，方便程式判斷
let pageCurrent = 1;

// 把收藏資料的變數拉出來，方便運用
// 如果localStorage裡面沒東西抓不到favoriteMovies的話，就讓list等於空陣列
// 前面放JSON.parse()是以JSON格式的方式將抓到的字串變成JS資料型態（陣列或物件）
// 相反地，JSON.stringify()是把JS內容以JSON格式變成字串
const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

// function區 ///////////////////////////////////////////////////////////////////////////////////////
function renderMovieList(data) {
  let rawHTML = "";

  // 把電影資料依照瀏覽樣式用Template Literals渲染出來
  // 要在More按鈕標籤上新增data-id='${item.id}'，事件監聽器裡的event.target.dataset.id才抓得到
  // 直接在Template Literals裡用三元運算子判斷是否已加入收藏，並回傳對應的class，達到收藏鈕變色效果
  if (flagOfDisplayForCardOrList === 0) {
    rawHTML = '<div class="d-flex flex-wrap">';
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-2 p-2">
        <div class="mb-2">
          <div class="card">
            <img src="${
              POSTER_URL + item.image
            }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-end">
                <button class="btn btn-info btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
                  item.id
                }">More</button>
                <i class="${
                  list.some((movie) => movie.id === item.id)
                    ? "fa-solid text-danger"
                    : "fa-regular"
                } fa-heart fa-2x btn btn-add-favorite" data-id="${item.id}"></i>
            </div>
          </div>
        </div>
      </div>
      `;
    });
  } else {
    rawHTML = "<div>";
    data.forEach((item) => {
      rawHTML += `
      <div class="d-flex border-top border-3 my-3 p-3 align-items-center justify-content-center">
        <h5 class="d-flex flex-grow-1 my-auto fs-3 fw-bold">${item.title}</h5>
        <div>    
          <button class="my-auto btn btn-info btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <i class="my-auto ${
            list.some((movie) => movie.id === item.id)
              ? "fa-solid text-danger"
              : "fa-regular"
          } fa-heart fa-2x btn btn-add-favorite" data-id="${item.id}"></i>
        </div>
      </div>
      `;
    });
  }

  rawHTML += "</div>";
  dataPanel.innerHTML = rawHTML;
}

// 分頁器渲染，產生分頁的數量
function renderPaginator(amount) {
  //e.g. 80/12 = 6頁，剩餘電影也要1頁，所以6.xx無條件進位成7
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
  paginator.firstElementChild.classList.add("active");
}

// 分頁內容擷取函式，把每頁要呈現的電影擷取出來
// page 1 => 0 - 11
// page 2 => 12 - 23
// page 3 => 24 - 35
// 以此類推
function getMoviesByPage(page) {
  // 如果filteredMovies.length有長度就回傳filteredMovies，沒有就回傳movies
  const data = filteredMovies.length ? filteredMovies : movies;

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 做個函式讓電影的More按下去後出現的視窗能讀到該卡片資料
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release Date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="'img-fluid">`;
  });
}

// 收藏功能，若已收藏則移除收藏
function addToFavorite(id) {
  // 在movies裡用find()去找需要的東西，括號內用箭頭函式
  // 當某部電影id跟收藏功能參數內輸入id一樣時，find()裡面就是true，然後就回傳該movie
  const movie = movies.find((movie) => movie.id === id);

  // 如果list裡已經有了，就移除
  // some()是檢查陣列裡是否有元素符合某條件，只會回傳true或false，不會回傳元素
  if (list[0]) {
    if (list.some((movie) => movie.id === id)) {
      let index = list.findIndex((movie) => movie.id === id);
      list.splice(index, 1);
      localStorage.setItem("favoriteMovies", JSON.stringify(list));
      renderMovieList(getMoviesByPage(pageCurrent));
      // alert("Just removed it successfully.") //可加提醒視窗
      return;
    }
  }

  // 把找到的那部movie放進list
  list.push(movie);

  // 將更新後的list，變成JSON字串，再放進favoriteMovies
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  renderMovieList(getMoviesByPage(pageCurrent));
  // alert("Just added it successfully :)"); //可加提醒視窗
}

// 事件監聽器區 ////////////////////////////////////////////////////////////////////////////////////////////
// 點擊More就啟動函式功能讓視窗能讀到該卡片資料，點擊收藏就啟動收藏功能
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 點擊下方分頁就渲染出對應的電影資料
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return; // 若不是點擊<a>標籤的元素則結束函式
  const page = Number(event.target.dataset.page);
  pageCurrent = page;
  // 把頁碼放入getMoviesByPage，擷取出需要的電影陣列，再用renderMovieList渲染出來
  renderMovieList(getMoviesByPage(pageCurrent));

  // 反白過的頁碼要恢復原狀
  paginator.childNodes.forEach((e) => {
    if (e.classList.contains("active")) {
      e.classList.remove("active");
    }
  });

  // 讓這次點擊的頁碼反白
  event.target.parentElement.classList.add("active");
});

// 只要使用者用關鍵字搜尋，就把關鍵字用filter去篩選
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault(); // 防止網頁自動觸發預設行為，在這邊是重新整理
  const keyword = searchInput.value.trim().toLowerCase();

  // 這個寫法也可以，只是下面那個寫法更簡潔
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // 如果字串長度為0，會是false，前面加個!讓它變true，意即萬一字串長度為0就執行
  // if (!keyword.length) {
  //   return alert("Please enter a valid string.");
  // }
  // 但這個方法不太好，因為還要再寫其他code去決定關鍵字找不到電影時該做什麼
  // 所以下面這個方法就是只要過濾後沒東西或輸入空值，就跳出警告視窗
  if (filteredMovies.length === 0 || keyword.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword);
  }

  // 下面的頁碼也要重新渲染，不然會出現搜尋結果只有3筆卻出現7個分頁的狀況
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1)); // 先顯示第1頁就好
});

// 讓使用者決定以card或list樣式瀏覽電影清單
iconsView.addEventListener("click", function onIconsViewClicked(event) {
  if (event.target.matches(".fa-grip")) {
    flagOfDisplayForCardOrList = 0;
  } else if (event.target.matches(".fa-bars")) {
    flagOfDisplayForCardOrList = 1;
  }
  renderMovieList(getMoviesByPage(pageCurrent));
});

// 串API資料 /////////////////////////////////////////////////////////////////////////////////////////

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieList(getMoviesByPage(1)); // 先顯示第1頁就好
});
