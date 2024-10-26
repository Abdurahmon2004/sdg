let detail = document.querySelector('.modal-detail');
let selectedOptions = {};
let selectedVariant = null;
let addToCardCheck = false;
let characterNames = [];
let selectedCharacterNames = [];
let productPrice = '';
let erorrMessage = document.querySelector('.error')
let productCount = 1;
let loader = document.getElementById('loader');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const addToCartButton = document.getElementById('add-to-cart');
const decrementButton = document.querySelector('.decrement');
const incrementButton = document.querySelector('.increment');  // Plus button (+)
const countDisplay = document.querySelector('.count-display'); // The number in the middle
const selector = document.querySelector('.quantity-selector')

countDisplay.innerText = productCount;

decrementButton.addEventListener('click', () => {
    if (addToCardCheck) {
        if (productCount > 1) {
            productCount--;
            countDisplay.innerText = productCount;
            incrementButton.classList.remove('grey')
            let locale = cart.find(item => item.product_id === selectedVariant.product_id);
            if (locale) {
                locale.count = productCount;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
        } if (productCount == 1) {
            decrementButton.classList.add('grey')
        }
    } else {
        erorrMessage.innerText = 'Opsiyani tanlang';
    }
});


incrementButton.addEventListener('click', () => {
    if (addToCardCheck) {
        if (selectedVariant.available_count > productCount) {
            productCount++;
            countDisplay.innerText = productCount;
            decrementButton.classList.remove('grey');
            let locale = cart.find(item => item.product_id === selectedVariant.product_id);
            if (locale) {
                locale.count = productCount;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        if (selectedVariant.available_count == productCount) {
            incrementButton.classList.add('grey');
        }
    } else {
        erorrMessage.innerText = 'Opsiyani tanlang';
    }
});


let modal = document.getElementById('modal');

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.classList.add('none');
    }
});
let close = document.getElementById('close')
close.addEventListener('click', () => {
    modal.classList.add('none');
})

addToCartButton.addEventListener('click', function () {
    if (!addToCartButton.disabled && selectedVariant) {
        selector.classList.remove('none')
        this.classList.add('none')
        const orderData = {
            product_id: selectedVariant.product_id,
            variant_id: selectedVariant.product_variant_id,
            count: 1,
        };
        if (productCount == 1) {
            decrementButton.classList.add('grey')
        }
        let existingProductIndex = cart.findIndex(item => item.product_id === orderData.product_id);

        if (existingProductIndex !== -1) {
            cart[existingProductIndex].count = productCount;
        } else {
            cart.push(orderData);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Buyurtma ma\'lumotlari:', orderData);
    } else {
        erorrMessage.innerText = 'Opsiyani tanlang';
        console.log('Variant tanlanmagan yoki mavjud emas.');
    }
});
function clearModalContent() {
    const productContainer = document.getElementById('product-container');
    const filtersContainer = document.getElementById('dynamic-filters-container');
    const slides = document.getElementById('detailSlide');
    const availabilityContainer = document.getElementById('availability');

    productContainer.innerHTML = '';
    filtersContainer.innerHTML = '';
    slides.innerHTML = '';
    availabilityContainer.innerHTML = '';
    productCount = 1;
    selectedOptions = {};
    selectedVariant = null;
    selectedCharacterNames = [];
    addToCardCheck = false;
}
function getDetail(slug) {
    const token = localStorage.getItem('token');
    loader.style.display = 'block';
    detail.classList.remove('none')

    const apiUrl = baseUrl + '/product/' + slug
    clearModalContent();
    fetch(apiUrl, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // LocalStorage'dan olingan tokenni yuborish
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                loader.style.display = 'none';
                renderProduct(data.data);
                renderDynamicFilters(data.data);
                renderImage(data.data);
            } else {
                console.error('Mahsulot ma\'lumotlarini olishda xatolik yuz berdi.');
            }
        })
        .catch(error => console.error('Xato:', error));

    function renderProduct(product) {
        const productContainer = document.getElementById('product-container');
        const productName = `<p class="product_name">${product.name}</p>`;
        productPrice = `<div class="character_name prPrice" >Narxi: <p id="price">${product.price}</p> so'm</div>`;
        productContainer.innerHTML = productName + productPrice;
    }

    function renderDynamicFilters(product) {
        const filtersContainer = document.getElementById('dynamic-filters-container');
        const characters = product.productVariant.characters;
        let name = '';
        characters.forEach(character => {
            const filterSection = document.createElement('div');
            filterSection.classList.add('characters')
            const filterTitle = document.createElement('p');
            filterTitle.textContent = `Tanlang: ${character.name}`;
            filterTitle.classList.add('character_name')
            filtersContainer.appendChild(filterTitle);
            name = character.name.toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            characterNames.push(character.name)
            character.values.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.name;
                button.dataset.character = character.name;
                button.dataset.value = option.name;
                button.dataset.name = name;
                button.classList.add('character')
                button.addEventListener('click', () => selectOption(character.name, option.name, product, button));
                filterSection.appendChild(button);
            });

            filtersContainer.appendChild(filterSection);
        });
        let existingProduct = cart.find(item => item.product_id === product.id);

        console.log(existingProduct);
        console.log(cart);
        console.log(product.id);

        if (existingProduct) {
            console.log('Mahsulot savatda mavjud');
            selector.classList.remove('none');
            addToCartButton.classList.add('none');
            productCount = existingProduct.count;
            if (countDisplay) {
                countDisplay.innerText = existingProduct.count;
            }
            // Mahsulotning variantlarini qayta tanlash
            product.productVariant.variant.forEach(variant => {
                if (variant.product_variant_id == existingProduct.variant_id) {
                    let buttons = document.querySelectorAll('.character');
                    variant.characters.forEach(character => {
                        // Hozir button o'zgaruvchisi aniqlanmagan, uni qayta aniqlashimiz kerak
                        buttons.forEach(btn => {
                            console.log(btn)
                            if (btn.dataset.value == character.value) {
                                selectOption(character.character, character.value, product, btn);
                            }
                        });
                    });
                }
            });

        } else {
            // Agar mahsulot savatda mavjud bo'lmasa
            addToCartButton.classList.remove('none'); // Add to Cart tugmasini ko'rsatish
            selector.classList.add('none');  // selector ni yashirish
        }
    }
    function renderImage(product) {
        const slides = document.getElementById('detailSlide');
        product.images.forEach(image => {
            const slide = document.createElement('div')
            slide.classList.add('swiper-slide')
            const img = document.createElement('img');
            img.src = image.image
            slide.appendChild(img);
            slides.appendChild(slide)
        })
        console.log(slides)
        var swiper = new Swiper(".productDetailImageSwiper", {
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            loop: true,
            // autoplay: {
            //     delay: 2500,
            //     disableOnInteraction: false,
            // },
        });
    }
    function selectOption(character, value, product, button) {
        let btns = document.querySelectorAll('.character');
        btns.forEach(btn => {
            if (btn.dataset.name == button.dataset.name) {
                btn.classList.remove('selected')
            }
        });
        button.classList.add('selected')
        selectedOptions[character] = value;

        selectedCharacterNames.push(character);
        addToCardCheck = product.productVariant.characters.every(
            (character) => {
                return selectedCharacterNames
                    .map((value) => value.toLowerCase())
                    .includes(character.name.toLowerCase());
            }
        );
        erorrMessage.innerText = '';
        updateButtonStates(product);
        if (addToCardCheck) {
            let price = document.getElementById('price')
            checkAvailability(product);
            if (selectedVariant) {
                if (selectedVariant.discout) {
                    price.innerText = selectedVariant.discount
                } else {
                    price.innerText = selectedVariant.price
                }
            }
        }
    }

    function updateButtonStates(product) {
        const selectedKeys = Object.keys(selectedOptions);
        const allButtons = document.querySelectorAll('#dynamic-filters-container button');

        allButtons.forEach(button => {
            const character = button.dataset.character;
            const value = button.dataset.value;

            let isCombinationAvailable = product.productVariant.variant.some(variant => {
                return variant.characters.some(char => char.character === character && char.value === value) &&
                    selectedKeys.every(key => {
                        return key === character ||
                            variant.characters.some(char => char.character === key && char.value === selectedOptions[key]);
                    });
            });

            if (isCombinationAvailable) {
                button.classList.remove('disabled');
                button.disabled = false;
            } else {
                button.classList.add('disabled');
                // button.disabled = true;
            }
        });
    }

    function checkAvailability(product) {
        const selectedKeys = Object.keys(selectedOptions);

        if (selectedKeys.length > 0) {
            const availableVariant = product.productVariant.variant.find(variant => {
                return selectedKeys.every(key => {
                    return variant.characters.some(char => char.character === key && char.value === selectedOptions[key]);
                });
            });

            const availabilityContainer = document.getElementById('availability');
            const addToCartButton = document.getElementById('add-to-cart');
            if (availableVariant && availableVariant.available_count > 0) {
                let locale = cart.find(item => item.product_id === product.id);
                if(locale){
                    locale.variant_id = availableVariant.product_variant_id
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                if (productCount >= availableVariant.available_count) {
                    productCount = availableVariant.available_count
                    countDisplay.innerText = productCount
                    incrementButton.classList.add('grey')
                } else {
                    incrementButton.classList.remove('grey')
                }
                availabilityContainer.innerHTML = `<div class="available">Mavjud (${availableVariant.available_count} dona omborda)</div>`;
                addToCartButton.disabled = false;
                addToCartButton.classList.remove('disabled');
                selectedVariant = availableVariant;
            } else {
                availabilityContainer.innerHTML = `<div class="not-available">Mavjud emas</div>`;
                addToCartButton.disabled = true;
                addToCartButton.classList.add('disabled');
                selectedVariant = null;
            }
        }
    }

};
