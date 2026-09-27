const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = null;

/* ==============================
ЗАГРУЗКА JSON
============================== */

async function loadSchedule() {
try {
const response = await fetch(
"https://ssg18.github.io/raspisanie-test/schedule.json"
);

```
    if (!response.ok) {
        throw new Error("HTTP " + response.status);
    }

    scheduleData = await response.json();

    console.log("JSON загружен:", scheduleData);

    fillGroups();

} catch (error) {
    console.error("Ошибка загрузки:", error);

    scheduleContainer.innerHTML =
        "<p>Ошибка загрузки расписания.</p>";
}
```

}

/* ==============================
ЗАПОЛНЕНИЕ ГРУПП
============================== */

function fillGroups() {

```
groupSelect.innerHTML = "";

const defaultOption = document.createElement("option");

defaultOption.value = "";
defaultOption.textContent = "Выберите группу";

groupSelect.appendChild(defaultOption);


if (
    !scheduleData ||
    !Array.isArray(scheduleData.groups)
) {
    console.error("Массив groups не найден");
    return;
}


scheduleData.groups.forEach(function(group) {

    if (!group || !group.grp) {
        return;
    }

    const option = document.createElement("option");

    option.value = String(group.grp);
    option.textContent = String(group.grp);

    groupSelect.appendChild(option);
});
```

}

/* ==============================
ПОНЕДЕЛЬНИК НЕДЕЛИ
============================== */

function getMonday(date) {

```
const result = new Date(date);

result.setHours(0, 0, 0, 0);

const day = result.getDay();


/*
    JavaScript:

    0 = воскресенье
    1 = понедельник
    2 = вторник
    3 = среда
    4 = четверг
    5 = пятница
    6 = суббота
*/

if (day === 0) {

    result.setDate(
        result.getDate() - 6
    );

} else {

    result.setDate(
        result.getDate() - day + 1
    );
}


return result;
```

}

/* ==============================
ИНФОРМАЦИЯ О НЕДЕЛЕ
============================== */

function getWeekInfo() {

```
const today = new Date();

today.setHours(0, 0, 0, 0);


/*
    В будни показываем текущую неделю.

    В субботу и воскресенье
    показываем следующую неделю.
*/

const targetDate = new Date(today);

const day = today.getDay();


if (day === 0 || day === 6) {

    targetDate.setDate(
        targetDate.getDate() + 7
    );
}


const monday =
    getMonday(targetDate);


const sunday =
    new Date(monday);


sunday.setDate(
    sunday.getDate() + 6
);


/*
    Определяем 1 сентября
    текущего учебного года.
*/

let academicYearStart;


if (today.getMonth() >= 8) {

    academicYearStart =
        new Date(
            today.getFullYear(),
            8,
            1
        );

} else {

    academicYearStart =
        new Date(
            today.getFullYear() - 1,
            8,
            1
        );
}


/*
    Первый понедельник
    учебного года.
*/

const firstMonday =
    getMonday(
        academicYearStart
    );


/*
    Расстояние между неделями.
*/

const millisecondsInWeek =
    7 * 24 * 60 * 60 * 1000;


const difference =
    monday.getTime() -
    firstMonday.getTime();


const weekNumber =
    Math.floor(
        difference /
        millisecondsInWeek
    ) + 1;


return {
    weekNumber: weekNumber,
    monday: monday,
    sunday: sunday
};
```

}

/* ==============================
ФОРМАТ ДАТЫ
============================== */

function formatDate(date) {

```
const day =
    String(
        date.getDate()
    ).padStart(2, "0");


const month =
    String(
        date.getMonth() + 1
    ).padStart(2, "0");


const year =
    date.getFullYear();


return (
    day +
    "." +
    month +
    "." +
    year
);
```

}

/* ==============================
ПРОВЕРКА НОМЕРА НЕДЕЛИ
============================== */

function isLessonInWeek(
lesson,
weekNumber
) {

```
/*
    Если ws отсутствует,
    считаем занятие постоянным.
*/

if (
    lesson.ws === undefined ||
    lesson.ws === null ||
    lesson.ws === ""
) {
    return true;
}


/*
    Поддерживаем:

    2,4,6,8
    1-17
    2,4,6-10

    Также заменяем длинные тире
    обычным дефисом.
*/

const weeksString =
    String(lesson.ws)
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/\s/g, "");


const parts =
    weeksString.split(",");


for (
    let i = 0;
    i < parts.length;
    i++
) {

    const part =
        parts[i];


    /*
        Диапазон недель.
    */

    if (
        part.indexOf("-") !== -1
    ) {

        const range =
            part.split("-");


        const start =
            Number(range[0]);


        const end =
            Number(range[1]);


        if (
            !Number.isNaN(start) &&
            !Number.isNaN(end) &&
            weekNumber >= start &&
            weekNumber <= end
        ) {
            return true;
        }


    } else {

        /*
            Одиночный номер недели.
        */

        const week =
            Number(part);


        if (
            !Number.isNaN(week) &&
            week === weekNumber
        ) {
            return true;
        }
    }
}


return false;
```

}

/* ==============================
ПОКАЗ РАСПИСАНИЯ
============================== */

function showSchedule(group) {

```
if (
    !scheduleData ||
    !Array.isArray(
        scheduleData.schedule
    )
) {

    console.error(
        "Массив schedule не найден"
    );

    return;
}


scheduleContainer.innerHTML = "";


const weekInfo =
    getWeekInfo();


/*
    ==========================
    КОДЫ API КГМУ
    ==========================

    1 = воскресенье
    2 = понедельник
    3 = вторник
    4 = среда
    5 = четверг
    6 = пятница
    7 = суббота

    Поэтому воскресенье
    не выводим.
*/

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


/* ==============================
   ЗАГОЛОВОК НЕДЕЛИ
   ============================== */

const weekHeader =
    document.createElement("div");


weekHeader.className =
    "week-header";


weekHeader.innerHTML =
    "<h2>Неделя №" +
    weekInfo.weekNumber +
    "</h2>" +

    "<p>" +
    formatDate(
        weekInfo.monday
    ) +

    " — " +

    formatDate(
        weekInfo.sunday
    ) +

    "</p>";


scheduleContainer.appendChild(
    weekHeader
);


/* ==============================
   ДНИ НЕДЕЛИ
   ============================== */

days.forEach(function(day) {


    /*
        Получаем только те занятия,
        которые:

        1. относятся к этому дню;
        2. относятся к выбранной группе;
        3. относятся к текущей неделе.
    */

    const lessons =
        scheduleData.schedule.filter(
            function(lesson) {


                /*
                    Проверка дня.
                */

                const correctDay =
                    Number(
                        lesson.wd
                    ) === day.number;


                /*
                    Проверка группы.
                */

                const correctGroup =
                    Array.isArray(
                        lesson.sg
                    ) &&

                    lesson.sg.some(
                        function(item) {

                            return (
                                String(item) ===
                                String(group)
                            );
                        }
                    );


                /*
                    Проверка недели.
                */

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


    /*
        Сортировка занятий
        по времени начала.
    */

    lessons.sort(
        function(a, b) {

            return String(
                a.ts || ""
            ).localeCompare(
                String(
                    b.ts || ""
                )
            );
        }
    );


    /* ==============================
       СОЗДАЁМ БЛОК ДНЯ
       ============================== */

    const dayBlock =
        document.createElement(
            "div"
        );


    dayBlock.className =
        "day";


    const dayTitle =
        document.createElement(
            "h3"
        );


    dayTitle.textContent =
        day.name;


    dayBlock.appendChild(
        dayTitle
    );


    /* ==============================
       ЕСЛИ НЕТ ЗАНЯТИЙ
       ============================== */

    if (
        lessons.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "Занятий нет";


        empty.className =
            "no-lessons";


        dayBlock.appendChild(
            empty
        );


    } else {


        /* ==============================
           ВЫВОД ЗАНЯТИЙ
           ============================== */

        lessons.forEach(
            function(lesson) {

                const lessonElement =
                    document.createElement(
                        "div"
                    );


                lessonElement.className =
                    "lesson";


                /*
                    Тип занятия.
                */

                let lessonType =
                    "";


                if (
                    Number(
                        lesson.lt
                    ) === 102
                ) {

                    lessonType =
                        "Лекция";


                } else if (
                    Number(
                        lesson.lt
                    ) === 103
                ) {

                    lessonType =
                        "Практика";
                }


                /*
                    Формируем HTML.
                */

                let html = "";


                html +=
                    "<div class='lesson-time'>" +
                    (lesson.ts || "") +
                    " – " +
                    (lesson.te || "") +
                    "</div>";


                html +=
                    "<div class='lesson-subject'>" +
                    (lesson.ln ||
                        "Без названия") +
                    "</div>";


                if (
                    lessonType
                ) {

                    html +=
                        "<div class='lesson-type'>" +
                        lessonType +
                        "</div>";
                }


                if (
                    lesson.tn
                ) {

                    html +=
                        "<div class='lesson-teacher'>" +
                        lesson.tn +
                        "</div>";
                }


                if (
                    lesson.loc
                ) {

                    html +=
                        "<div class='lesson-location'>" +
                        lesson.loc +
                        "</div>";
                }


                if (
                    lesson.ws
                ) {

                    html +=
                        "<div class='lesson-weeks'>" +
                        "Недели: " +
                        lesson.ws +
                        "</div>";
                }


                lessonElement.innerHTML =
                    html;


                dayBlock.appendChild(
                    lessonElement
                );
            }
        );
    }


    scheduleContainer.appendChild(
        dayBlock
    );
});
```

}

/* ==============================
ВЫБОР ГРУППЫ
============================== */

groupSelect.addEventListener(
"change",
function() {

```
    const selectedGroup =
        this.value;


    if (
        !selectedGroup
    ) {

        scheduleContainer.innerHTML =
            "";

        return;
    }


    showSchedule(
        selectedGroup
    );
}
```

);

/* ==============================
ЗАПУСК
============================== */

loadSchedule();
