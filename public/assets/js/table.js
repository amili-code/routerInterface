let data = ''
let createdDataTitle;
let createdDataapi;
let createdDataId;


async function createTable(title, api, id) {
    const getData = await apiRequest(`/${api}`);
    const table = document.getElementById(`${id}`)
    const fieldsArray = Object.keys(getData[0]).filter(key => key !== "updatedAt" && key !== "id");
    const persianArrey = translateFields(fieldsArray)
    createTrThead(persianArrey, id)
    createTrTbody(getData, id, api)
    data = await getData
    createdDataTitle = await title
    createdDataapi = await api
    createdDataId = await id
}

function translateFields(fieldsArray) {
    let persianArrey = []
    fieldsArray.forEach(fields => {
        let persianWord = ""

        switch (fields) {
            case "name":
                persianWord = "نام"
                break;

            case "username":
                persianWord = "نام کاربری"
                break;

            case "password":
                persianWord = "رمز عبور"
                break;

            case "ip":
                persianWord = "ای پی (ip)"
                break;

            case "port":
                persianWord = "درگاه ارتباط (port)"
                break;

            case "createdAt":
                persianWord = "تاریخ شکل گیری"
                break;

            case "download":
                persianWord = "دانلود"
                break;

            case "upload":
                persianWord = "میزان آپلود"
                break;

            case "tx":
                persianWord = "TX"
                break;

            case "rx":
                persianWord = "TX"
                break;

            case "timeLimit":
                persianWord = "محدودیت زمانی"
                break;

            case "routerId":
                persianWord = "روتر"
                break;
            case "routerName":
                persianWord = "نام روتر"
                break;


            default:
                break;
        }


        persianArrey.push(persianWord)
    })

    return persianArrey
}

function createTrThead(fieldsArray, id) {
    const tr = document.getElementById(`${id}-tr`)
    tr.innerHTML = ''
    fieldsArray.forEach(field => {
        tr.innerHTML += `
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${field}</th>
        `
    });
    tr.innerHTML += `
        <th class="text-secondary text-xxs font-weight-bolder opacity-7">ویرایش</th>
        <th class="text-secondary text-xxs font-weight-bolder opacity-7">حذف</th>
    `
}

function createTrTbody(data, id, api) {
    const tr = document.getElementById(`${id}-tbody`)
    tr.innerHTML = ``
    let tbody = '<tr>'
    data.forEach(item => {

        for (const key in item) {
            if (key == "id" || key == "updatedAt") continue
            if (key == "createdAt") item[key] = convertToJalaliDate(item[key])

            tbody += `
                <td class="align-middle text-center text-sm">
                 <h6 class="text-xs font-weight-bold mb-0">${item[key]}</h6>
                </td>
            `
        }
        tbody += `
            <td class="align-middle text-center text-sm">
                <button type="button" onClick="editModal(${item["id"]} , '${item["name"]}' , '${api}')" class="badge badge-sm bg-gradient-warning " style="border:none">ویرایش</button>
            </td>
            <td class="align-middle text-center text-sm">
                <button type="button" onClick="deleteModal(${item["id"]} , '${item["name"]}' , '${api}')" class="badge badge-sm bg-gradient-danger" style="border:none">حذف</button>
            </td></tr>
        `
    })
    tr.innerHTML = tbody
}

function translator(data) {
    let returnedData;
    switch (data) {
        case "name":
            returnedData = "نام"
            break;

        case "username":
            returnedData = "نام کاربری"
            break;

        case "password":
            returnedData = "رمز عبور"
            break;

        case "ip":
            returnedData = "ای پی (ip)"
            break;

        case "port":
            returnedData = "درگاه ارتباط (port)"
            break;

        case "createdAt":
            returnedData = "تاریخ شکل گیری"
            break;
        case "download":
            returnedData = "دانلود"
            break;

        case "upload":
            returnedData = "میزان آپلود"
            break;

        case "tx":
            returnedData = "TX"
            break;

        case "rx":
            returnedData = "TX"
            break;

        case "timeLimit":
            returnedData = "محدودیت زمانی"
            break;

        case "routerId":
            returnedData = "روتر"
            break;
        case "routerName":
            returnedData = "نام روتر"
            break;


        default:
            break;
    }
    return returnedData
}


function deleteModal(id, name, api) {
    const modalViewer = document.getElementById(`modal-creator-${api}`);
    // ساختار HTML مودال
    modalViewer.innerHTML = `
        <div id="modal-overlay" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); display: flex;
            align-items: center; justify-content: center; z-index: 1000;">
            
            <div style="
                background: white; padding: 20px; border-radius: 10px;
                width: 300px; text-align: center; box-shadow: 0px 4px 10px rgba(0,0,0,0.2);">
                
                <h4 style="margin-bottom: 10px;font-family=peyda">عملیات حذف /h4>
                <p>آیا مطمئن هستید که می‌خواهید "<b>${name}</b>" را حذف کنید؟</p>
                
                <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                    <button id="confirm-delete" style="
                        background: red; color: white; border: none; padding: 10px;
                        width: 45%; border-radius: 5px; cursor: pointer;">حذف</button>
                    
                    <button id="cancel-delete" style="
                        background: gray; color: white; border: none; padding: 10px;
                        width: 45%; border-radius: 5px; cursor: pointer;">لغو</button>
                </div>
            </div>
        </div>
    `;

    // دریافت دکمه‌ها
    document.getElementById("confirm-delete").addEventListener("click", function () {
        deleteRouter(id, api);  // تابع حذف را اجرا می‌کند
        closeModal();
    });

    document.getElementById("cancel-delete").addEventListener("click", closeModal);
    document.getElementById("modal-overlay").addEventListener("click", function (e) {
        if (e.target.id === "modal-overlay") closeModal();
    });

    // تابع بستن مودال
    function closeModal() {
        modalViewer.innerHTML = "";
    }
}

// تابع حذف (در صورت نیاز جایگزین کنید)
async function deleteRouter(id, api) {
    try {
        const response = await apiRequest(`/${api}/${id}`, 'DELETE');

        // نمایش پیام موفقیت
        Swal.fire({
            title: " عملیات حذف ",
            text: "با موفقیت حذف شد!",
            icon: "success",
            confirmButtonText: "متوجه شدم",
            confirmButtonColor: "#d33", // دکمه قرمز
            timer: 3000,
            timerProgressBar: true,
            showClass: {
                popup: "animate__animated animate__fadeInDown"
            },
            hideClass: {
                popup: "animate__animated animate__fadeOutUp"
            }
        });
        createTable(createdDataTitle, api, `table-${api}`)
    } catch (error) {
        console.error("خطا در حذف روتر:", error);

        // نمایش پیام خطا در صورت عدم موفقیت
        Swal.fire({
            title: "خطا!",
            text: "حذف روتر با مشکل مواجه شد.",
            icon: "error",
            confirmButtonText: "متوجه شدم",
            confirmButtonColor: "#d33"
        });
    }

}


async function editModal(id, name, api) {
    console.log(id, name, api);
    data = await apiRequest(`/${api}`);

    // جستجوی آیتم مورد نظر بر اساس ID
    const item = data.find(item => item.id === id);
    if (!item) {
        console.error("آیتمی با این ID پیدا نشد!");
        return;
    }

    // اگر مودال از قبل وجود دارد، حذف کن
    const existingModal = document.getElementById("edit-modal");
    if (existingModal) existingModal.remove();

    // فچ کردن داده‌های رابطه‌ای (مثلاً دریافت لیست روترها)
    let relatedData = {};
    if (api === "limitation") { // چک کردن اینکه آیا جدول نیاز به داده رابطه‌ای دارد؟
        relatedData.routers = await apiRequest("/routers"); // دریافت لیست روترها
    }

    // ایجاد فرم داینامیک
    let formFields = "";
    let fieldCount = 0;

    for (const key in item) {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt") { // فیلدهای غیرقابل ویرایش حذف شوند
            if (key === "routerName" && relatedData.routers) {
                // اگر فیلد رابطه‌ای است، `select` بساز
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <select name="routerId" id="edit-routerId" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                        ${relatedData.routers.map(router => `
                            <option value="${router.id}" ${router.name === item[key] ? "selected" : ""}>
                                ${router.name}
                            </option>
                        `).join("")}
                    </select>
                `;
            } else {
                // اگر فیلد معمولی است، `input` بساز
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <input type="text" name="${key}" id="edit-${key}" value="${item[key]}" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                `;
            }
        }
    }

    const modalWidth = Math.min(400 + fieldCount * 20, 800);
    // ایجاد HTML مودال به‌صورت داینامیک
    const modal = document.createElement("div");
    modal.id = "edit-modal";
    modal.innerHTML = `
      <div style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;
            z-index: 1000;
        ">
            <div style="
                background: white; padding: 20px; width: ${modalWidth}px; border-radius: 10px; 
                box-shadow: 0px 0px 10px rgba(0,0,0,0.2); max-height: 80vh; overflow-y: auto;
            ">
                <h6 style="margin-bottom: 15px;">ویرایش اطلاعات ${name}</h6>
                <form id="edit-form" style="display: grid; gap: 10px;">
                    ${formFields}
                    <input type="submit" value="ثبت تغییرات" class="btn bg-gradient-dark w-100 mb-2">
                </form>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <button onclick="closeModal()" class="btn btn-outline-dark w-100" style="background: gray; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">لغو</button>
                </div>
            </div>
        </div>
    `;

    // اضافه کردن مودال به صفحه
    document.body.appendChild(modal);
    document.getElementById("edit-form").addEventListener("submit", function (event) {
        event.preventDefault(); // جلوگیری از ارسال فرم به صورت پیش‌فرض

        // دریافت داده‌های فرم
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        // ارسال داده‌ها
        editModalFetch(data, id, api);
    });
}



function editModalFetch(data, id, api) {
    console.log(api);
    apiRequest(`/${api}/${id}`, "PUT", data);
    Swal.fire({
        title: "اطلاعات به درستی اپدیت شدند!",
        text: `روتر "${data.name}" با موفقیت ثبت شد.`,
        icon: "success",
        confirmButtonText: "متوجه شدم",
        confirmButtonColor: '#43A047',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
            popup: "animate__animated animate__fadeInDown"
        },
        hideClass: {
            popup: "animate__animated animate__fadeOutUp"
        }
    });
    createTable(createdDataTitle, api, `table-${api}`)
    document.getElementById("edit-form").reset();
    closeModal()
}


// تابع بستن مودال
function closeModal() {
    const modal = document.getElementById("edit-modal");
    if (modal) modal.remove();
}


