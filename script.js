// ==========================================
// КГМУ — РАСПИСАНИЕ
// ==========================================

const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = null;


// ==========================================
// НАСТРОЙКИ УЧЕБНОГО ГОДА
// ==========================================

// Первый день учебного года
function getAcademicYearStart() {

    const today = new Date();

    let year = today.getFullYear();

    // Если сейчас январь-июль,
    // учебный год начался в предыдущем году
    if (today.getMonth() < 7) {
        year--;
    }

    return new Date(year, 8, 1);
}


// ==========================================
// ПОЛУЧЕНИЕ ПОНЕДЕЛЬНИКА НУЖНОЙ НЕДЕЛИ
// ==========================================

function getMonday(date) {

    const result = new Date(date);

    const day = result.getDay();

    // В JavaScript:
    // воскресенье = 0
    // понедельник = 1
    // ...
    // суббота = 6

    const difference =
        day === 0 ? -6 : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(0, 0, 0, 0);

    return result;
}


// ==========================================
// ПОЛУЧЕНИЕ ВОСКРЕСЕНЬЯ НЕДЕЛИ
// ==========================================

function getSunday(date) {

    const monday = getMonday(date);

    const sunday = new Date(monday);

    sunday.setDate(
        sunday.getDate() + 6
    );

    sunday.setHours(23, 59, 59, 999);

    return sunday;
}


// ==========================================
// ОПРЕДЕЛЕНИЕ НЕДЕЛИ
// ==========================================

function getCurrentWeekInfo() {

    const today = new Date();

    let targetDate = new Date(today);


    // Если суббота или воскресенье —
    // показываем следующую неделю
    const day = today.getDay();

    if (day === 6 || day === 0) {

        targetDate.setDate(
            targetDate.getDate() + 7
        );

    }


    const monday =
        getMonday(targetDate);

    const sunday =
        getSunday(targetDate);


    // Первый день учебного года
    const academicStart =
        getAcademicYearStart();


    // Понедельник недели,
    // в которую попадает 1 сентября
    const firstMonday =
        getMonday(academicStart);


    // Разница между неделями
    const difference =
        monday.getTime() -
        firstMonday.getTime();


    const millisecondsInWeek =
        7 * 24 * 60 * 60 * 1000;


    const weekNumber =
        Math.floor(
            difference / millisecondsInWeek
        ) + 1;


    return {
        weekNumber,
        monday,
        sunday
    };
}


// ==========================================
// ФОРМАТ ДАТЫ
// ==========================================

function formatDate(date) {

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}.${month}.${year}`;
}


// ==========================================
// ЗАГОЛОВОК ТЕКУЩЕЙ НЕДЕЛИ
// ==========================================

function createWeekHeader() {

    const weekInfo =
        getCurrentWeekInfo();


    const header =
        document.createElement("div");

    header.className =
        "week-info";


    header.innerHTML = `
        <div class="week-number">
            Неделя №${weekInfo.weekNumber}
        </div>

        <div class="week-dates">
            ${formatDate(weekInfo.monday)}
            —
            ${formatDate(weekInfo.sunday)}
        </div>
    `;


    return header;
}


// ==========================================
// ПРОВЕРКА НОМЕРА НЕДЕЛИ
// ==========================================

function isLessonInWeek(
    lesson,
    currentWeek
) {

    if (!lesson.ws) {
        return true;
    }


    const weekText =
        String(lesson.ws)
            .replace(/\s/g, "");


    // Получаем отдельные значения:
    //
    // 1
    // 2,4,6
    // 2-13
    // 2,4,6,8-10

    const parts =
        weekText.split(",");


    for (const part of parts) {

        // Диапазон: 2-13
        if (part.includes("-")) {

            const range =
                part.split("-");

            const start =
                Number(range[0]);

            const end =
                Number(range[1]);

            if (
                currentWeek >= start &&
                currentWeek <= end
            ) {
                return true;
            }

        } else {

            // Одиночная неделя
            if (
                Number(part) === currentWeek
            ) {
                return true;
            }

        }

    }


    return false;
}


// ==========================================
// ЗАГРУЗКА РАСПИСАНИЯ
// ==========================================

async function loadSchedule() {

    try {

        console.log(
            "Начинаем загрузку расписания..."
        );


        const response = await fetch(
            "https://ssg18.github.io/raspisanie-test/schedule.json"
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const json =
            await response.json();


        scheduleData =
            json;


        console.log(
            "Расписание загружено:",
            scheduleData
        );


        if (!scheduleData) {

            throw new Error(
                "JSON пустой"
            );

        }


        if (
            !Array.isArray(
                scheduleData.groups
            )
        ) {

            throw new Error(
                "В JSON отсутствует массив groups"
            );

        }


        if (
            !Array.isArray(
                scheduleData.schedule
            )
        ) {

            throw new Error(
                "В JSON отсутствует массив schedule"
            );

        }


        console.log(
            "Количество групп:",
            scheduleData.groups.length
        );


        console.log(
            "Количество занятий:",
            scheduleData.schedule.length
        );


        fillGroups();


    } catch (error) {

        console.error(
            "Ошибка загрузки:",
            error
        );


        scheduleContainer.innerHTML = `
            <p style="color:red;">
                Ошибка загрузки расписания:
                ${error.message}
            </p>
        `;

    }

}


// ==========================================
// ЗАПОЛНЕНИЕ СПИСКА ГРУПП
// ==========================================

function fillGroups() {

    console.log(
        "Начинаем заполнение групп..."
    );


    groupSelect.replaceChildren();


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        "Выберите группу";


    groupSelect.appendChild(
        defaultOption
    );


    if (
        !scheduleData ||
        !Array.isArray(scheduleData.groups)
    ) {

        console.error(
            "Не удалось получить список групп"
        );

        return;
    }


    scheduleData.groups.forEach(
        group => {

            if (
                !group ||
                !group.grp
            ) {
                return;
            }


            const option =
                document.createElement("option");


            option.value =
                String(group.grp);


            option.textContent =
                String(group.grp);


            groupSelect.appendChild(
                option
            );

        }
    );


    console.log(
        "Группы загружены:",
        scheduleData.groups.map(
            group => group.grp
        )
    );

}


// ==========================================
// ВЫБОР ГРУППЫ
// ==========================================

groupSelect.addEventListener(
    "change",
    function () {

        const selectedGroup =
            String(this.value);


        console.log(
            "Выбрана группа:",
            selectedGroup
        );


        if (!selectedGroup) {

            scheduleContainer.innerHTML = "";

            return;
        }


        showSchedule(
            selectedGroup
        );

    }
);


// ==========================================
// ОТОБРАЖЕНИЕ РАСПИСАНИЯ
// ==========================================

function showSchedule(group) {

    console.log(
        "Показываем расписание группы:",
        group
    );


    scheduleContainer.innerHTML = "";


    // Получаем текущую учебную неделю
    const weekInfo =
        getCurrentWeekInfo();


    console.log(
        "Номер учебной недели:",
        weekInfo.weekNumber
    );


    // Заголовок с датами
    scheduleContainer.appendChild(
        createWeekHeader()
    );


    const days = [

        {
            number: 2,
            name: "Понедельник"
        },

        {
            number: 3,
            name: "Вторник"
        },

        {
            number: 4,
            name: "Среда"
        },

        {
            number: 5,
            name: "Четверг"
        },

        {
            number: 6,
            name: "Пятница"
        },

        {
            number: 7,
            name: "Суббота"
        }

    ];


    days.forEach(
        day => {


            // Получаем занятия
            // выбранной группы
            // в конкретный день
            // и конкретную неделю

            const lessons =
                scheduleData.schedule.filter(
                    lesson => {

                        if (!lesson) {
                            return false;
                        }


                        // Проверяем день
                        const correctDay =
                            Number(lesson.wd) ===
                            day.number;


                        // Проверяем группу
                        const correctGroup =
                            Array.isArray(
                                lesson.sg
                            ) &&
                            lesson.sg.some(
                                item =>
                                    String(item) ===
                                    String(group)
                            );


                        // Проверяем неделю
                        const correctWeek =
                            isLessonInWeek(
                                lesson,
                                weekInfo.weekNumber
                            );


                        return (
                            correctDay &&
                            correctGroup &&
                            correctWeek
                        );

                    }
                );


            // Сортировка по времени
            lessons.sort(
                (a, b) => {

                    return String(
                        a.ts || ""
                    ).localeCompare(
                        String(
                            b.ts || ""
                        )
                    );

                }
            );


            // Создаём день
            const dayElement =
                document.createElement("div");


            dayElement.className =
                "day";


            // Название дня
            const title =
                document.createElement("h2");


            title.textContent =
                day.name;


            dayElement.appendChild(
                title
            );


            // Если пар нет
            if (
                lessons.length === 0
            ) {

                const empty =
                    document.createElement("p");


                empty.textContent =
                    "Пар нет";


                empty.className =
                    "empty-day";


                dayElement.appendChild(
                    empty
                );

            }


            // Добавляем пары
            lessons.forEach(
                lesson => {


                    const lessonElement =
                        document.createElement("div");


                    lessonElement.className =
                        "lesson";


                    // Время
                    const time =
                        document.createElement("div");


                    time.className =
                        "lesson-time";


                    time.textContent =
                        `${lesson.ts || ""}–${lesson.te || ""}`;


                    // Предмет
                    const subject =
                        document.createElement("div");


                    subject.className =
                        "lesson-subject";


                    subject.textContent =
                        lesson.ln ||
                        "Без названия";


                    // Тип
                    const type =
                        document.createElement("div");


                    type.className =
                        "lesson-info";


                    type.textContent =
                        getLessonType(
                            lesson.lt
                        );


                    // Преподаватель
                    const teacher =
                        document.createElement("div");


                    teacher.className =
                        "lesson-info";


                    teacher.textContent =
                        lesson.tn ||
                        "Преподаватель не указан";


                    // Аудитория
                    const room =
                        document.createElement("div");


                    room.className =
                        "lesson-info";


                    room.textContent =
                        lesson.loc ||
                        "Аудитория не указана";


                    // Недели
                    const weeks =
                        document.createElement("div");


                    weeks.className =
                        "lesson-info";


                    weeks.textContent =
                        lesson.ws
                            ? `Недели: ${lesson.ws}`
                            : "Недели: все";


                    lessonElement.appendChild(
                        time
                    );


                    lessonElement.appendChild(
                        subject
                    );


                    lessonElement.appendChild(
                        type
                    );


                    lessonElement.appendChild(
                        teacher
                    );


                    lessonElement.appendChild(
                        room
                    );


                    lessonElement.appendChild(
                        weeks
                    );


                    dayElement.appendChild(
                        lessonElement
                    );

                }
            );


            scheduleContainer.appendChild(
                dayElement
            );

        }
    );

}


// ==========================================
// ТИП ЗАНЯТИЯ
// ==========================================

function getLessonType(type) {

    const lessonType =
        Number(type);


    if (lessonType === 102) {
        return "Лекция";
    }


    if (lessonType === 103) {
        return "Практика";
    }


    return `Тип занятия: ${type}`;

}


// ==========================================
// ЗАПУСК
// ==========================================

loadSchedule();
