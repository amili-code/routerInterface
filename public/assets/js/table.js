let data = ''
let createdDataTitle;
let createdDataapi;
let createdDataId;

let paginator = []

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
            case "macAddress":
                persianWord = "مک ادرس"
                break;
            case "blockedIp":
                persianWord = "ایپی در زمان بلاک شدن"
                break;
            case "comment":
                persianWord = "توضیحات"
                break;
            case "totalDownload":
                persianWord = "مقدار کل دانلود"
                break;
            case "totalUpload":
                persianWord = "مقدار کل اپلود"
                break;
            case "totalUsage":
                persianWord = "مقدار کل استفاده"
                break;
            case "modifier":
                persianWord = "شرکت سازنده"
                break;
            case "uniqueClients":
                persianWord = "نام کاربران استفاده شده"
                break;
            case "totalClients":
                persianWord = "تعداد کاربران"
                break;
            default:
                break;
        }


        persianArrey.push(persianWord)
    })

    return persianArrey
}

const paginationNumber = 5;
let filteredData = null;






async function pagination(id, currentPage, totalPages) {
    if (totalPages == 0 || totalPages ==1)  return
    
    if(filteredData == null)
    document.getElementById(`${id}-pagination`).innerHTML = `
        <button onClick="changePage('${id}', 1, '${totalPages}')" class="badge badge-sm bg-gradient-info" ${currentPage === 1 ? 'disabled' : ''}>اولین صفحه</button>
        <button onClick="changePage('${id}', ${currentPage} - 1, '${totalPages}')" class="badge badge-sm bg-gradient-info" ${currentPage === 1 ? 'disabled' : ''}>قبلی</button>
        <span>صفحه ${currentPage} از ${totalPages}</span>
        <button onClick="changePage('${id}', ${currentPage} + 1, '${totalPages}')" class="badge badge-sm bg-gradient-info" ${currentPage == totalPages ? 'disabled' : ''}>بعدی</button>
        <button onClick="changePage('${id}', ${totalPages}, '${totalPages}')" class="badge badge-sm bg-gradient-info" ${currentPage === totalPages ? 'disabled' : ''}>آخرین صفحه</button>
    `;
}

async function changePage(id, index, total) {



    paginator.forEach(item => {
        if (item.name == id) {
            item.currentPage = index
            pagination(id, index, total);
            renderTable(filteredData || item.data, id, item.api, index); // اگر فیلتر شده باشد، فقط داده‌های فیلتر شده نمایش داده شود
        }
    });
}

async function renderTable(mainData, id, api, currentPage) {
    const start = (currentPage - 1) * paginationNumber;
    const end = start + paginationNumber;
    const paginatedData = mainData.slice(start, end);

    createTrTbody(paginatedData, id, api);
}

async function createTable(title, api, id) {
    try {
        const getData = await apiRequest(`/${api}`);
        const table = document.getElementById(`${id}`);

        if (getData.length > 0) {
            const fieldsArray = Object.keys(getData[0]).filter(key => key !== "updatedAt" && key !== "id");
            const persianArrey = translateFields(fieldsArray);
            createTrThead(persianArrey, id);

                let bool = false;
                paginator.forEach(page => {
                    if (page.name == id) {
                        pagination(id, page.currentPage, page.total);
                        renderTable(getData, id, api, page.currentPage);
                        bool = true;
                    }
                });

                if (!bool) {
                    paginator.push({ name: id, currentPage: 1, total: Math.ceil(getData.length / paginationNumber), data: getData, api });
                    pagination(id, 1, Math.ceil(getData.length / paginationNumber));
                    renderTable(getData, id, api, 1);
                }
           
        } else {
            document.getElementById(`${id}-tbody`).innerHTML = `
                <h5 class='text-black text-capitalize ps-1 m-2'>موردی پیدا نشد!</h5>
            `;
        }
    } catch (error) {
        console.log(error);
    }
}

// ✅ تابع جستجو
function searchTable(id) {
    const searchInput = document.getElementById('searchInpute').value.trim().toLowerCase();

    paginator.forEach(item => {
        if (item.name == id) {
            if (searchInput === "") {
                // اگر ورودی خالی بود، همه اطلاعات بازگردانده شوند
                filteredData = null;
                renderTable(item.data, id, item.api, 1);
                pagination(id, 1, Math.ceil(item.data.length / paginationNumber));
            } else {
                // console.log(id);
                // فیلتر کردن داده‌ها
                filteredData = item.data.filter(row =>
                    Object.values(row).some(value => String(value).toLowerCase().includes(searchInput))
                );

                // نمایش اطلاعات فیلتر شده
                renderTable(filteredData, id, item.api, 1);
                pagination(id, 1, Math.ceil(filteredData.length / paginationNumber));
            }
        }
    });
}

// ✅ اضافه کردن لیسنر برای جستجو
    setTimeout(() => {
        let listTable = ['table-routers', 'table-limitation', 'table-profile', 'table-client', 'table-block-client', 'table-session', 'table-active']



        document.getElementById('searchInpute').addEventListener('input', () => {
            listTable.forEach(table => {
                searchTable(table)
            })
        });



    }, 1000);

// function createTrTbody(data, id, api) {
//     const tr = document.getElementById(`${id}-tbody`);
//     tr.innerHTML = ``;
//     let tbody = '<tr>';

//     data.forEach(item => {
//         for (const key in item) {
//             if (key == "id" || key == "updatedAt") continue;
//             if (key == "createdAt") item[key] = convertToJalaliDate(item[key]);
//             if (key == "started") item[key] = convertToJalaliDate(item[key]);
//             if (key == "lastAccountingPacket") item[key] = convertToJalaliDate(item[key]);

//             tbody += `
//                 <td class="align-middle text-center text-sm">
//                     <h6 class="text-xs font-weight-bold mb-0">${item[key]}</h6>
//                 </td>
//             `;
//         }

//         if (id == "table-block-client") {
//             tbody += `<td class="align-middle text-center text-sm">
//                 <button type="button" onClick="returnModal(${item["id"]}, '${item["clientName"]}', '${api}')" class="badge badge-sm bg-gradient-secondary">بازگردانی</button>
//             </td></tr>`;
//         } else if (id == "table-active") {
//             tbody += `<td class="align-middle text-center text-sm">
//                 <button type="button" onClick="removeActivate('${item["userAddress"]}', '${item["acctSessionId"]}', '${item["callingStationId"]}')" class="badge badge-sm bg-gradient-danger">قطع ارتباط</button>
//             </td></tr>`;
//         } else if (id == "table-session") {
//             tbody += `<td class="align-middle text-center text-sm">
//                 <button type="button" onClick="addBlockList('${item["userAddress"]}', '${item["clientFullName"]}', '${item["callingStationId"]}')" class="badge badge-sm bg-gradient-danger">مسدود کردن کاربر</button>
//             </td></tr>`;
//         } else {
//             tbody += `
//                 <td class="align-middle text-center text-sm">
//                     <button type="button" onClick="editModal(${item["id"]}, '${item["name"]}', '${api}')" class="badge badge-sm bg-gradient-warning">ویرایش</button>
//                 </td>
//                 <td class="align-middle text-center text-sm">
//                     <button type="button" onClick="deleteModal(${item["id"]}, '${item["name"]}', '${api}')" class="badge badge-sm bg-gradient-danger">حذف</button>
//                 </td></tr>
//             `;
//         }
//     });

//     tr.innerHTML = tbody;
// }






function createTrTbody(data, id, api) {
    const tr = document.getElementById(`${id}-tbody`)
    tr.innerHTML = ``
    let tbody = '<tr>'
    data.forEach(item => {

        for (const key in item) {
            if (key == "id" || key == "updatedAt") continue
            if (key == "createdAt") item[key] = convertToJalaliDate(item[key])
            if (key == "started") item[key] = convertToJalaliDate(item[key])
            if (key == "lastAccountingPacket") {
                item[key] = convertToJalaliDate(item[key])
            }

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
            tbody += `<td class="align-middle text-center text-sm">
                    <button type="button" onClick="removeActivate('${item["userAddress"]}' , '${item["acctSessionId"]}' , '${item["callingStationId"]}')" class="badge badge-sm bg-gradient-danger " style="border:none">قطع ارتباط</button>
                    </td></tr>`
        } else if (id == "table-danger") {
            tbody += `<td class="align-middle text-center text-sm">
                    <button type="button" onClick="addBlockList('${item["callingStationId"]}')" class="badge badge-sm bg-gradient-danger " style="border:none">مسدود کردن کاربر</button>
                    </td></tr>`
        } else if (id == "table-session" || id == "table-terminated" || id == "table-mousted") {
            tbody += `</tr>`
        } else if (id == "table-blocked") {
            tbody += `<td class="align-middle text-center text-sm">
                    <button type="button" onClick="showListConnection('${item["macAddress"]}')" class="badge badge-sm bg-gradient-secondary  " style="border:none">نمایش تمام ارتباطات کاربر</button>
                    </td>
                    <td class="align-middle text-center text-sm">
                        <button type="button" onClick="backMac('${item["macAddress"]}')" class="badge badge-sm bg-gradient-primary " style="border:none">بازگردانی</button>
                    </td>
                    </tr>`
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



function createTrThead(fieldsArray, id) {
    const tr = document.getElementById(`${id}-tr`)
    tr.innerHTML = ''
    fieldsArray.forEach(field => {
        tr.innerHTML += `
            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style="text-align:center">${field}</th>
        `
    });
    if (id == "table-block-client") {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">بازگردانی</th>
        `
    } else if (id == "table-active") {
        tr.innerHTML += `
                    <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">قطع ارتباط</th>
        `
    } else if (id == "table-danger") {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">افزودن مسدودیت</th>
        `
    } else if (id == "table-blocked") {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">نمایش تمام فعالیت ها</th>
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">بازگردانی این دیوایس</th>
        `
    } else if (id == "table-session" || id == "table-terminated" || id == "table-mousted") {
        tr.innerHTML += ``
    } else {
        tr.innerHTML += `
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">ویرایش</th>
            <th class="text-secondary text-xxs font-weight-bolder opacity-7 style="text-align:center"">حذف</th>
        `
    }
}

function removeActivate(userName, sessionId, mac) {
    // ایجاد پس‌زمینه‌ی مودال
    let modalBackground = document.createElement("div");
    modalBackground.style.position = "fixed";
    modalBackground.style.top = "0";
    modalBackground.style.left = "0";
    modalBackground.style.width = "100%";
    modalBackground.style.height = "100%";
    modalBackground.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modalBackground.style.display = "flex";
    modalBackground.style.justifyContent = "center";
    modalBackground.style.alignItems = "center";
    modalBackground.style.zIndex = "1000";

    // ایجاد محتوای مودال
    let modalContent = document.createElement("div");
    modalContent.style.background = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
    modalContent.style.textAlign = "center";

    let message = document.createElement("p");
    message.innerText = `آیا می‌خواهید کاربر ${userName} با MAC: ${mac} را از اتصال به اینترنت منع کنید؟`;
    modalContent.appendChild(message);

    // دکمه‌های تایید و لغو
    let confirmBtn = document.createElement("button");
    confirmBtn.innerText = "بله";
    confirmBtn.style.margin = "10px";
    confirmBtn.style.padding = "8px 16px";
    confirmBtn.style.backgroundColor = "#d9534f";
    confirmBtn.style.color = "#fff";
    confirmBtn.style.border = "none";
    confirmBtn.style.borderRadius = "4px";
    confirmBtn.style.cursor = "pointer";
    confirmBtn.onclick = async function () {
        const response = await apiRequest(`/activite-terminate/${sessionId}`);
        document.body.removeChild(modalBackground);
        Swal.fire({
            title: "ارتباط قطع شد!",
            text: `ارتباط کاربر به خوبی قطع شد`,
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
        createTable("جدول پروفایل ها", "active-client", "table-active")
    };

    let cancelBtn = document.createElement("button");
    cancelBtn.innerText = "خیر";
    cancelBtn.style.margin = "10px";
    cancelBtn.style.padding = "8px 16px";
    cancelBtn.style.backgroundColor = "#5bc0de";
    cancelBtn.style.color = "#fff";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onclick = function () {
        document.body.removeChild(modalBackground);
    };

    modalContent.appendChild(confirmBtn);
    modalContent.appendChild(cancelBtn);
    modalBackground.appendChild(modalContent);
    document.body.appendChild(modalBackground);
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
        case "macAddress":
            returnedData = "مک ادرس"
            break;
        case "blockedIp":
            returnedData = "ایپی در زمان بلاک شدن"
            break;
        case "comment":
            returnedData = "توضیحات"
            break;

        case "totalDownload":
            returnedData = "مقدار کل دانلود"
            break;
        case "totalUpload":
            returnedData = "مقدار کل اپلود"
            break;
        case "totalUsage":
            returnedData = "مقدار کل استفاده"
            break;
        case "modifier":
            returnedData = "شرکت سازنده"
            break;
        case "uniqueClients":
            returnedData = "نام کاربران استفاده شده"
            break;
        case "totalClients":
            returnedData = "تعداد کاربران"
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


function addBlockList(mac) {
    // ایجاد و نمایش مودال تأیید
    const modal = document.createElement("div");
    modal.id = "modal-overlay";
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; padding: 20px; border-radius: 12px;
            width: 350px; text-align: center; box-shadow: 0px 6px 15px rgba(0,0,0,0.3);
            display: flex; flex-direction: column; align-items: center;">
            
            <h3 style="margin-bottom: 15px; font-family: sans-serif;">بلاک کردن MAC Address</h3>
            <p style="font-size: 14px; color: #333;">آیا مطمئن هستید که می‌خواهید مک آدرس "<b>${mac}</b>" را بلاک کنید؟</p>

            <!-- فیلد ورودی توضیحات -->
            <textarea id="block-comment" placeholder="دلیل بلاک را وارد کنید..." style="
                width: 90%; height: 60px; margin-top: 10px; padding: 8px;
                border: 1px solid #ccc; border-radius: 6px; font-size: 14px;
                resize: none;"></textarea>

            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="confirm-block" style="
                    background: #d32f2f; color: white; border: none; padding: 10px 20px;
                    border-radius: 6px; cursor: pointer; font-size: 14px;">بلاک</button>
                
                <button id="cancel-block" style="
                    background: #757575; color: white; border: none; padding: 10px 20px;
                    border-radius: 6px; cursor: pointer; font-size: 14px;">لغو</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // دکمه‌های تأیید و لغو
    document.getElementById("confirm-block").addEventListener("click", async () => {
        const comment = document.getElementById("block-comment").value.trim() || "بلاک شده توسط کاربر"; // دریافت مقدار توضیح
        modal.remove(); // حذف مودال بعد از تأیید

        try {
            const response = await apiRequest(`/block-mac`, "POST", { mac, comment });
            if (response) {
                Swal.fire({
                    title: "عملیات موفق!",
                    text: `مک آدرس "${mac}" با موفقیت بلاک شد."`,
                    icon: "success",
                    confirmButtonText: "متوجه شدم",
                    confirmButtonColor: '#43A047',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: { popup: "animate__animated animate__fadeInDown" },
                    hideClass: { popup: "animate__animated animate__fadeOutUp" }
                });
                createTable("جدول پروفایل ها", "block-mac", "table-blocked")    
            }
        } catch (error) {
            Swal.fire({
                title: "خطا!",
                text: "مشکلی در بلاک کردن مک آدرس رخ داد. لطفاً دوباره امتحان کنید.",
                icon: "error",
                confirmButtonText: "متوجه شدم",
                confirmButtonColor: '#D32F2F'
            });
        }
    });

    document.getElementById("cancel-block").addEventListener("click", () => {
        modal.remove(); // حذف مودال در صورت لغو
    });
}


function showListConnection(mac) {
    const modal = document.createElement("div");
    modal.id = "modal-overlay";
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; padding: 20px; border-radius: 12px;
            width: 80%; text-align: center; box-shadow: 0px 6px 15px rgba(0,0,0,0.3);
            display: flex; flex-direction: column; align-items: center;">
             <div class="card my-4">
                <div
                    class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                    <div
                        class="bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-1 m-2">اطلاعات
                            ${mac}</h6>
                    </div>
                </div>
            <div class="card-body px-0 pb-2">
                        <div class="table-responsive p-0">
                            <table class="table align-items-center mb-0"
                                id="table-terminated">
                                <thead>
                                    <tr id="table-terminated-tr">
                                    </thead>
                                    <tbody id="table-terminated-tbody">
                                    </tbody>
                            </table>
                            <div class="container-fluid p-2" style="text-align: center;" id="table-terminated-pagination"></div>
                            </div>
                            </div>
                            </div>
                            <div style="margin-top: 20px; display: flex; gap: 10px;">
                                <button id="cancel-block" style="width: 100%;" class="badge badge-sm bg-gradient-dark ">بستن</button>
                            </div>
            </div>
        </div>
           

        </div>
    `;
    document.body.appendChild(modal);
    createTable("جدول پروفایل ها", `mac/${mac}`, "table-terminated")


    document.getElementById("cancel-block").addEventListener("click", () => {
        modal.remove(); // حذف مودال در صورت لغو
    });
}


function backMac(mac) {
    const modal = document.createElement("div");
    modal.id = "modal-overlay";
    modal.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: white; padding: 20px; border-radius: 12px;
            width: 350px; text-align: center; box-shadow: 0px 6px 15px rgba(0,0,0,0.3);
            display: flex; flex-direction: column; align-items: center;">
            
            <h3 style="margin-bottom: 15px; font-family: sans-serif;">بازگردانی MAC Address</h3>
            <p style="font-size: 14px; color: #333;">آیا مطمئن هستید که می‌خواهید مک آدرس "<b>${mac}</b>" را برگردانید؟</p>

            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="confirm-block" style="
                    background: #d32f2f; color: white; border: none; padding: 10px 20px;
                    border-radius: 6px; cursor: pointer; font-size: 14px;">بازگردانی</button>
                
                <button id="cancel-block" style="
                    background: #757575; color: white; border: none; padding: 10px 20px;
                    border-radius: 6px; cursor: pointer; font-size: 14px;">لغو</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // دکمه‌های تأیید و لغو
    document.getElementById("confirm-block").addEventListener("click", async () => {
        modal.remove(); // حذف مودال بعد از تأیید

        try {
            const response = await apiRequest(`/mac-back/${mac}`);
            if (response) {
                Swal.fire({
                    title: "عملیات موفق!",
                    text: `مک آدرس "${mac}" با موفقیت بلاک شد."`,
                    icon: "success",
                    confirmButtonText: "متوجه شدم",
                    confirmButtonColor: '#43A047',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: { popup: "animate__animated animate__fadeInDown" },
                    hideClass: { popup: "animate__animated animate__fadeOutUp" }
                });
                createTable("جدول پروفایل ها", "block-mac", "table-blocked")    
            }
        } catch (error) {
            Swal.fire({
                title: "خطا!",
                text: "مشکلی در بلاک کردن مک آدرس رخ داد. لطفاً دوباره امتحان کنید.",
                icon: "error",
                confirmButtonText: "متوجه شدم",
                confirmButtonColor: '#D32F2F'
            });
        }
    });

    document.getElementById("cancel-block").addEventListener("click", () => {
        modal.remove(); // حذف مودال در صورت لغو
    });
}
