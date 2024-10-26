const baseUrl = 'https://magic.lingolab.uz/api';
const urlParams = new URLSearchParams(window.location.search);
const hashToken = urlParams.get('hashToken');
if (hashToken) {
    localStorage.setItem('token', hashToken)
}

async function getApi(url, successCallback, errorCallback) {
    const token = localStorage.getItem('token'); // LocalStorage'dan tokenni olish
    try {
        const response = await fetch(baseUrl + url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // LocalStorage'dan olingan tokenni yuborish
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        successCallback(data);
    } catch (error) {
        (errorCallback || console.error)('Fetch error:', error);
    }
}

async function getProducts(urlProduct, section) {
    let url = urlProduct;
    await getApi(url, function (response) {
        renderProduct(response.data, section);
    }, function (error) {
        console.error('Error:', error);
    });
}

function renderProduct(products, section) {
    let productHtml = '';
    let price = 0;
    let realPrice = '';
    products.forEach(product => {
        if (product.discount > 0) {
            price = product.discount
            realPrice = product.price
        } else {
            price = product.price
        }
        productHtml +=
            `
          <div class="product" >
              <div class="image">
                <img src="${product.images?.image}" alt="">
                <p class="discount ${realPrice ? '' : 'none'}">
                    10 %
                </p>
                <span class="favorite">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 17.6918H9.8167C9.6471 17.6649 9.48994 17.5863 9.3667 17.4668L2.95837 11.0501C2.14219 10.1751 1.69765 9.01728 1.71847 7.82086C1.73929 6.62444 2.22384 5.48283 3.06996 4.63671C3.91609 3.79058 5.05769 3.30603 6.25412 3.28521C7.45054 3.26439 8.60831 3.70893 9.48337 4.52511L10 5.00011L10.5 4.50011C11.3678 3.63958 12.5404 3.15674 13.7625 3.15674C14.9846 3.15674 16.1573 3.63958 17.025 4.50011C17.8896 5.36574 18.3752 6.53916 18.3752 7.76261C18.3752 8.98605 17.8896 10.1595 17.025 11.0251L10.6084 17.4418C10.5292 17.5225 10.4345 17.5863 10.3299 17.6293C10.2253 17.6723 10.1131 17.6936 10 17.6918ZM6.20003 4.82511C5.6241 4.83248 5.06293 5.00828 4.58575 5.33084C4.10856 5.65339 3.73624 6.10858 3.51471 6.64025C3.29318 7.17192 3.23214 7.75681 3.33911 8.32276C3.44609 8.88872 3.7164 9.41097 4.1167 9.82511L9.95003 15.6584L15.7834 9.82511C16.335 9.27209 16.6448 8.52287 16.6448 7.74177C16.6448 6.96067 16.335 6.21146 15.7834 5.65844C15.5107 5.3833 15.1861 5.16491 14.8286 5.01587C14.471 4.86683 14.0874 4.79009 13.7 4.79009C13.3126 4.79009 12.9291 4.86683 12.5715 5.01587C12.2139 5.16491 11.8894 5.3833 11.6167 5.65844L10.525 6.74177C10.3689 6.89698 10.1577 6.9841 9.93753 6.9841C9.71738 6.9841 9.50617 6.89698 9.35003 6.74177L8.28337 5.69177C8.01051 5.41694 7.68594 5.19886 7.32837 5.05011C6.97079 4.90136 6.58731 4.82489 6.20003 4.82511Z" fill="#171E33"/>
                    </svg>
                </span>
              </div>
              <p class="text">
                Haylou aqlli soati
                RT-LS05S
              </p>
              <p class="price">
                ${price} so'm
              </p>
              <p class="real_price ${realPrice ? '' : 'none'}">${realPrice}</p>
              <button class="button" data-slug="${product.slug}" onclick="getDetail('${product.slug}')">
                Qo’shish <svg width="23" height="25" viewBox="0 0 23 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.29342 6.53551L1.05078 3.29287L2.46499 1.87866L5.70763 5.1213H20.9494C21.5017 5.1213 21.9494 5.56902 21.9494 6.1213C21.9494 6.21862 21.9352 6.31543 21.9073 6.40865L19.5073 14.4087C19.3804 14.8317 18.991 15.1214 18.5494 15.1214H6.29342V17.1214H17.2935V19.1214H5.29342C4.74113 19.1214 4.29342 18.6736 4.29342 18.1214V6.53551ZM6.29342 7.1213V13.1214H17.8054L19.6054 7.1213H6.29342ZM5.79342 23.1214C4.96499 23.1214 4.29342 22.4498 4.29342 21.6214C4.29342 20.7929 4.96499 20.1214 5.79342 20.1214C6.62185 20.1214 7.29342 20.7929 7.29342 21.6214C7.29342 22.4498 6.62185 23.1214 5.79342 23.1214ZM17.7935 23.1214C16.965 23.1214 16.2935 22.4498 16.2935 21.6214C16.2935 20.7929 16.965 20.1214 17.7935 20.1214C18.6219 20.1214 19.2935 20.7929 19.2935 21.6214C19.2935 22.4498 18.6219 23.1214 17.7935 23.1214Z" fill="#F7F7F7"/>
                    </svg>                    
              </button>
            </div>
        `
    });
    document.getElementById(section).insertAdjacentHTML('beforeend', productHtml)
}
async function getCategory(url) {
    await getApi(url, function (response) {
        renderCategory(response.data);
    }, function (error) {
        console.error('Error:', error);
    });
}
function renderCategory(categories) {
    let categoriesHtml = document.querySelector('#categories');
    let categoriesInnerText = '';

    categories.forEach(category => {
        let truncatedName = category.name.length > 20 ? category.name.substring(0, 20) + '...' : category.name;

        categoriesInnerText += `
        <div class="swiper-slide">
           <a href="#" class="link" data-slug="${category.slug}">
               <img src="${category.image}" alt=""> <span>${truncatedName}</span>
           </a>
        </div>
        `;
    });

    categoriesHtml.insertAdjacentHTML('beforeend', categoriesInnerText);

    categoriesHtml.insertAdjacentHTML('beforeend', categoriesInnerText);
    var swiper = new Swiper(".CategorySwiper", {
        slidesPerView: 2.2,
        spaceBetween: 20,
    });
}

async function getBanner(url) {
    await getApi(url, function (response) {
        renderBanner(response.data);
    }, function (error) {
        console.error('Error:', error);
    });
}
function renderBanner(banners) {
    let bannerHtml = document.querySelector('#banners')
    let bannersInnerText = '';
    banners.forEach(banner => {
        bannersInnerText += `
         <div class="swiper-slide">
            <div class="info">
                <p class="title">
                    ${banner.title}
                </p>
            </div>
            <img src="${banner.image}" alt="">
         </div>
        `
    });
    bannerHtml.insertAdjacentHTML('beforeend', bannersInnerText)
}

getBanner('/banner')
getCategory('/categories');
getProducts('/popularProductsLimit', 'popular')
getProducts('/discounted/productsLimit', 'discount')

