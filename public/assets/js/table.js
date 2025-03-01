let data = ''
let createdDataTitle;
let createdDataapi;
let createdDataId;


async function createTable(title, api, id) {
    try {
        console.log(api);
        const getData = await apiRequest(`/${api}`);
        const table = document.getElementById(`${id}`)
        if (getData.length > 0) {
            const fieldsArray = Object.keys(getData[0]).filter(key => key !== "updatedAt" && key !== "id");
            const persianArrey = translateFields(fieldsArray)
            createTrThead(persianArrey, id)
            createTrTbody(getData, id, api)
            data = await getData
            createdDataTitle = await title
            createdDataapi = await api
            createdDataId = await id
        } else {
            return false
        }
    } catch (error) {
        // console.log(title , api, table);
        console.log(error);
    }
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
                persianWord = "RX"
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
            case "price":
                persianWord = "قیمت (تومان)"
                break;
            case "startDate":
                persianWord = "تاریخ شروع"
                break;
            case "weekDays":
                persianWord = "بازه زمانی"
                break;
            case "limitationName":
                persianWord = "محدودیت"
                break;
            case "Clientname":
                persianWord = "نام"
                break;
            case "fullName":
                persianWord = "نام کاربری"
                break;
            case "roomNumber":
                persianWord = "شماره اتاق"
                break;
            case "ClientCount":
                persianWord = "تعداد مصرف کننده"
                break;
            case "profileName":
                persianWord = "پروفایل انتخابی"
                break;
            case "profilePrice":
                persianWord = "قیمت پرفایل"
                break;
            case "clientName":
                persianWord = "نام"
                break;
            case "clientRoomNumber":
                persianWord = "شماره اتاق کاربر"
                break;
            case "fullName":
                persianWord = "نام کاربری"
                break;
            case "reason":
                persianWord = "علت مسدودیت"
                break;
            case "userFullName":
                persianWord = "نام کاربری"
                break;
            case "roomNumber":
                persianWord = "شماره اتاق"
                break;
            case "acctSessionId":
                persianWord = "شناسه ارتباطی"
                break;
            case "callingStationId":
                persianWord = "مک ادرس دیوایس"
                break;
            case "userAddress":
                persianWord = "ای پی دیوایس"
                break;
            case "started":
                persianWord = " زمان شروع ارتباط"
                break;
            case "lastAccountingPacket":
                persianWord = "زمان پایان ارتباط"
                break;
            case "uptime":
                persianWord = "کل زمان ارتباط"
                break;
            case "userName":
                persianWord = "نام کاربر"
                break;

            case "clientFullName":
                persianWord = "نام کاربری"
                break;
            case "clientRoomNumber":
                persianWord = "شماره اتاق"
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
    if (id == "table-block-client") {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7">بازگردانی</th>
        `
    } else if (id == "table-active") {
        tr.innerHTML += ``
    } else if (id == "table-session") {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7">افزودن به بلک لیست</th>
        `
    } else {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7">ویرایش</th>
            <th class="text-secondary text-xxs font-weight-bolder opacity-7">حذف</th>
        `
    }
}

function createTrTbody(data, id, api) {
    const tr = document.getElementById(`${id}-tbody`)
    tr.innerHTML = ``
    let tbody = '<tr>'
    data.forEach(item => {

        for (const key in item) {
            if (id == "table-session") console.log(key);
            if (key == "id" || key == "updatedAt") continue
            if (key == "createdAt") item[key] = convertToJalaliDate(item[key])
            if (key == "started") item[key] = convertToJalaliDate(item[key])
            if (key == "lastAccountingPacket") item[key] = convertToJalaliDate(item[key])

            tbody += `
                <td class="align-middle text-center text-sm">
                 <h6 class="text-xs font-weight-bold mb-0">${item[key]}</h6>
                </td>
            `
        }
        if (id == "table-block-client") {
            tbody += `
            <td class="align-middle text-center text-sm">
                <button type="button" onClick="returnModal(${item["id"]} , '${item["clientName"]}' , '${api}')" class="badge badge-sm bg-gradient-secondary " style="border:none">بازگردانی</button>
            </td></tr>
            `
        } else if (id == "table-active") {
            tbody += ``
        } else if (id == "table-session") {
            tbody += `<td class="align-middle text-center text-sm">
                <button type="button" onClick="addBlockList('${item["userAddress"]}' , '${item["acctSessionId"]}' , '${item["callingStationId"]}')" class="badge badge-sm bg-gradient-info " style="border:none">افزودن به بلک لیست</button>
            </td></tr>`
        } else {
            tbody += `
            <td class="align-middle text-center text-sm">
                <button type="button" onClick="editModal(${item["id"]} , '${item["name"]}' , '${api}')" class="badge badge-sm bg-gradient-warning " style="border:none">ویرایش</button>
            </td>
            <td class="align-middle text-center text-sm">
                <button type="button" onClick="deleteModal(${item["id"]} , '${item["name"]}' , '${api}')" class="badge badge-sm bg-gradient-danger" style="border:none">حذف</button>
            </td></tr>
        `
        }
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
            returnedData = "RX"
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
        case "price":
            returnedData = "قیمت (تومان)"
            break;
        case "startDate":
            returnedData = "تاریخ شروع"
            break;
        case "weekDays":
            returnedData = "بازه زمانی"
            break;
        case "limitationName":
            returnedData = "محدودیت"
            break;
        case "Clientname":
            returnedData = "نام"
            break;
        case "fullName":
            returnedData = "نام کاربری"
            break;
        case "roomNumber":
            returnedData = "شماره اتاق"
            break;
        case "ClientCount":
            returnedData = "تعداد مصرف کننده"
            break;
        case "profileName":
            returnedData = "پروفایل انتخابی"
            break;
        case "profilePrice":
            returnedData = "قیمت پرفایل"
            break;
        case "clientName":
            returnedData = "نام"
            break;
        case "clientRoomNumber":
            returnedData = "شماره اتاق کاربر"
            break;
        case "fullName":
            returnedData = "نام کاربری"
            break;
        case "reason":
            returnedData = "علت مسدودیت"
            break;

        case "userFullName":
            returnedData = "نام کاربری"
            break;
        case "roomNumber":
            returnedData = "شماره اتاق"
            break;
        case "acctSessionId":
            returnedData = "شناسه ارتباطی"
            break;
        case "callingStationId":
            returnedData = "مک ادرس دیوایس"
            break;
        case "userAddress":
            returnedData = "ای پی دیوایس"
            break;
        case "started":
            returnedData = " زمان شروع ارتباط"
            break;
        case "lastAccountingPacket":
            returnedData = "زمان پایان ارتباط"
            break;
        case "uptime":
            returnedData = "کل زمان ارتباط"
            break;
        case "userName":
            returnedData = "نام کاربر"
            break;
        case "clientFullName":
            returnedData = "نام کاربری"
            break;
        case "clientRoomNumber":
            returnedData = "شماره اتاق"
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
                
                <h4 style="margin-bottom: 10px;font-family=peyda">عملیات حذف </h4>
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
        deleteRouter(id, api);
        // تابع حذف را اجرا می‌کند
        setTimeout(() => {
            createTable(createdDataTitle, api, `table-${api}`)
        }, 4000);
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
    } catch (error) {
        console.error("خطا در حذف :", error);

        // نمایش پیام خطا در صورت عدم موفقیت
        Swal.fire({
            title: "خطا!",
            text: "حذف  با مشکل مواجه شد.",
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

    // فچ کردن داده‌های رابطه‌ای (مثلاً دریافت لیست روترها یا محدودیت‌ها)
    let relatedData = {};
    if (api === "limitation") {
        relatedData.routers = await apiRequest("/routers");
    } else if (api === "profile") {
        relatedData.limitations = await apiRequest("/limitation"); // دریافت لیست محدودیت‌ها
    } else if (api === "client") {
        relatedData.profile = await apiRequest("/profile"); // دریافت لیست محدودیت‌ها
    }

    // ایجاد فرم داینامیک
    let formFields = "";
    let fieldCount = 0;

    for (const key in item) {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt") {
            if (key === "routerName" && relatedData.routers) {
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
            } else if (key === "limitationName" && relatedData.limitations) {
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <select name="limitationId" id="edit-limitationId" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                        ${relatedData.limitations.map(limitation => `
                            <option value="${limitation.id}" ${limitation.name === item[key] ? "selected" : ""}>
                                ${limitation.name}
                            </option>
                        `).join("")}
                    </select>
                `;
            } else if (key === "startDate" && api === "profile") {
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <select name="startDate" id="edit-startDate" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                        <option value="first_use" ${item[key] === "از اولین بار" ? "selected" : ""}>از اولین بار</option>
                        <option value="on_login" ${item[key] === "از موقع ورود" ? "selected" : ""}>از موقع ورود</option>
                    </select>
                `;
            } else if (key === "profileName" && relatedData.profile) {
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <select name="profileId" id="edit-limitationId" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                        ${relatedData.profile.map(prof => `
                            <option value="${prof.id}" ${prof.name === item[key] ? "selected" : ""}>
                                ${prof.name}
                            </option>
                        `).join("")}
                    </select>
                `
            } else {
                formFields += `
                    <label class="form-label text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">${translator(key)}</label>
                    <input type="text" name="${key}" id="edit-${key}" value="${item[key]}" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                `;
            }
        }
    }

    const modalWidth = Math.min(400 + fieldCount * 20, 800);
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

    document.body.appendChild(modal);
    document.getElementById("edit-form").addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        editModalFetch(data, id, api);
        setTimeout(() => {
            createTable(createdDataTitle, api, `table-${api}`)
        }, 3000);
    });
}




function editModalFetch(data, id, api) {
    console.log(api);
    console.log(data);
    apiRequest(`/${api}/${id}`, "PUT", data);
    Swal.fire({
        title: "اطلاعات به درستی اپدیت شدند!",
        text: `ایتم "${data.name}" با موفقیت ثبت شد.`,
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
    document.getElementById("edit-form").reset();
    closeModal()
}


// تابع بستن مودال
function closeModal() {
    const modal = document.getElementById("edit-modal");
    if (modal) modal.remove();
}


function addBlockList() {

}