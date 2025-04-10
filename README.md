Ticket Tool application ReactJS & NodeJS & sqlite based. sorry for this shitcode. для РУ описание ниже !!

## SCREENSHOTS
![{8ED5BFF7-20D8-4DA8-B651-A4C9B10815A3}](https://github.com/user-attachments/assets/a29fd751-92ff-4725-855c-86e5ece99901)
![{AD392A2C-73EE-4623-9A19-0E4E0D3BDC9C}](https://github.com/user-attachments/assets/453eb638-feb0-432e-8f9a-5c827c1e6e16)
![{9915FFBA-BA90-4930-ACE3-FC33FFD1B9D2}](https://github.com/user-attachments/assets/a2804cf3-6b3b-4092-a3f8-843c803198d6)
![{40A46B5D-9980-4847-8C7D-BCC7E450B524}](https://github.com/user-attachments/assets/5f03b6ed-75d1-4e15-be41-e5dc0b3dc4d3)
![{24FE4651-0E85-449A-ACF7-AC6B61329A28}](https://github.com/user-attachments/assets/79e71bf2-33b4-4f8a-b07a-3f8f2a312744)
![{BAF55849-FEE7-4D29-A377-B4326A25D753}](https://github.com/user-attachments/assets/7a7c5315-93d1-4fd9-ba14-7725a9eecc3b)
![{6F54CCA1-568E-466E-AFCA-86550DDFFF85}](https://github.com/user-attachments/assets/57a3cd94-c2c8-49e6-817d-418baef89d13)
![{7C2C076E-377F-4122-A8D6-BF78B4397702}](https://github.com/user-attachments/assets/ae6f6325-8af4-4ee8-87a9-336c66c977a8)
![{AA6825CE-6C1C-4914-A40D-2B298C349870}](https://github.com/user-attachments/assets/da48188e-bc03-4d72-8d56-f52cf119977c)







## HOW TO INSTALL

**1. INSTALL MODULES FOR SERVER**
- cd client
- npm install


**2. INSTALL MODULES FOR CLIENT**
- cd server
- npm install


**3. RUN CLIENT & SERVER**
- cd server
- npm run dev



- cd client
- npm start


**4. CREATE ACCOUNT WITH OWNER ROLE**
- cd server
- node create-owner.js


**5. RELOAD THE SERVER AND LOG IN**
- super.admin@servicetask.ru:owner123 - by default when u use create-owner.js





ENG:

hello everyone  
Before I jump into the app's structure, user hierarchy and general logic, quick note — this is a graduation project. The backend was written partly by AI and other people xD. That said, there’s not that much to fix. At the very end of this file I’ll describe what I think should be improved to make the app more usable. You’re free to do whatever you want with this code. I honestly don’t care.

---

## USER HIERARCHY

**Owner** – has unrestricted access to everything. no limits.

Next is an **isolated** group of users (each company is isolated. they can't see or interact with each other in any way)

**Admin** – company admin. Can:  
- do everything users with lower roles can  
- create users with any role, including other admins  
- deactivate any user account, including their own  
- edit anyone’s role (yes, even their own — and yes, they’ll lose access accordingly)  
- full control over tickets  
- hide tickets (hidden tickets are visible only to Owner – more on this in the tickets section)

**Techadmin** – technical admin. Can:  
- create users, but **only** with role `user`  
- full control over tickets, but **can't** hide them  
That’s all.

**User** – regular company user. Can:  
- create a ticket, change its status to `Closed`  
- see the list of users **within their own company** (same as admin and techadmin)

---

## TICKETS & HOW THEY WORK

User creates a ticket. After that, all they can do is close it.  
Users only see their own tickets – including open, in progress, and closed.

Techadmin sees **all** tickets within their company.  
They can:  
- change ticket status  
- open ticket page  
- leave comments

Admin can do everything techadmin can, plus:  
- hide tickets (again, hidden ones are visible **only** to Owner)

Owner can:  
- permanently delete any ticket  
- see absolutely **all** tickets from all companies

---

## ACCOUNT MANAGEMENT

- **User**:  
  can’t manage other accounts in any way  
  can edit their own data, view other users in their company, and see their profiles. that’s it.

- **Techadmin**:  
  can create users with `User` role. After that, same permissions as regular users.

- **Admin**:  
  can create users with **any** role  
  can edit names and roles of existing users  
  can freeze any account (not delete – deleting means losing all their tickets. freezing was safer.)

- **Owner**:  
  can create any user in any company  
  can also edit email and company for any user (but **not** password)  
  can permanently delete any user

---

## COMPANIES

Only **Owner** can create companies.  
When a company card is opened, any new user created will be assigned to that company.

Bugs found during deep testing will be listed below – only frontend bugs. backend’s not really my thing 😅

---

## PAGES 

- **Dashboard**  
  shows stats based on the tickets the user has access to.  
  regular user sees only their own ticket data.  
  hidden tickets don’t show up anywhere, even in stats – only visible to Owner.

- **Tickets**  
  shows a list of tickets.  
  users see only their own.  
  admin and techadmin see **all** tickets from their company.  
  users can close a ticket.  
  admins and techadmins can change status, open the ticket page.

- **Ticket page**  
  contains:  
  - ticket creator info  
  - ticket content (editable depending on role)  
  - full activity log  
  - private chat between people who can access the ticket

  note: user **can** open a ticket page by manually typing the link.  
  no buttons to access this view exist for users in the frontend.

- **Users**  
  - for owner: full list of all users + filter by company  
  - for admin/techadmin/user: list of users within **their** company  
  - creating user:  
    - Owner selects company  
    - Admin/Techadmin — company is auto-selected  
  - full functionality for freezing, deleting, editing accounts – all depends on role, see above

- **Companies**  
  - only visible to Owner  
  - can create new companies  
  - company card: basic info + list of that company's users  
  - new users created from this view are auto-assigned to the opened company

- **Settings**  
  same for everyone:  
  - dark mode  
  - “connecting the dots” visual effect  
  - sidebar auto-collapse (hover to expand, toggle to keep open/closed – top switch)  
  note: sidebar shifts layout – ideally fix this

- **Profile**  
  same for everyone.  
  - change name (just type the new one)  
  - change email (requires current password)  
  - change password (requires current password)  
  - other inputs are placeholders only

---

## THINGS TO FIX OR ADD

**must-do:**
- BACKEND SECURITY TESTS 🔥

**recommended improvements:**
- account logs (who changed what – name, email, password, role, status etc)  
- redesign dashboard  
- add full company-level logs for Owner (who created, edited, deleted what), with filters and search  
- allow sorting/filtering of tickets by company in company card  
- add ticket search  
- add profile pictures  
- fix the "connecting the dots" visibility in light mode  
- improve account editing logic for admins  
- improve ticket page logic – allow user to see the ticket view, maybe limit what they can do based on your vision  
- notification logic: tie to settings, maybe add delay/timer – useful feature  
- fix ticket/user/company list views – they don’t scale well with large text  
- improve frontend structure – currently AI-generated and janky  
- clean up duplicate code/components  
- check the auto-generated README too (comes first in English then in Russian – might be useful)





## RU:
всем привет ! прежде чем приступлю к обзору иерархии приложения, его сути логики и так далее, скажу что это дипломная работа. а бэкэнд вообще писался аишкой и другими людьми xD. но тем не менее фиксить не особо-то и много, в самом конце напишу что я считаю нужным добавить, что упростит работу с приложением. вы можете делать всё с ним, что захотите ! мне полностью на него всё равно.

## ИЕРАРХИЯ ПОЛЬЗОВАТЕЛЕЙ

Owner - может абсолютно всё, что возможно.

Далее идет ИЗОЛИРОВАННАЯ группа пользователей (изолированы компанией. то есть компании никак друг с другом не могут взаимодействовать от слова совсем)

Admin - администрация площадки. Может:
- может всё что и роли правами ниже
- создать любого юзера, даже со своей ролью
- может деактивировать любую учетку, даже себя
- может менять роли всем и даже себе                           (соответственно отредактировав собственную роль он теряет функционал. деактивировав учетку, не сможет на неё зайти.)
- полный контроль над тикетом
- скрывать тикеты (скрытые тикеты видит только овнер. позднее перейдём к тикетам там поймете)

Techadmin - технический администратор. может:
- создать учётную запись, но ТОЛЬКО с ролью user
- полный контроль над тикетами, но не может его скрыть
всё.

User - пользователей компании. может:
- создать тикет. изменить статус у открытого тикета на "Закрытый".
- ознакомиться со списком пользователей ЕГО компанаии, как и techadmin, как и admin

## ТИКЕТЫ И ИХ ЛОГИКА

User создаёт тикет. Всё что он может сделать после создания тикета - его закрыть. Пользователь видит только СВОИ тикеты. Видит открытые, в процессе, закрытые.

TechAdmin видит ВСЕ тикеты в его компании. Может изменить статус тикета, открыть его страницу, добавить комментарий.

Admin может всё вышеописанное, но помимо может скрывать тикет. (видит только овнер)

Owner может перманентно дельнуть тикет. Также видит абсолютли все тикеты всех компаний


## ВЗАИМОДЕЙСТВИЕ С УЧЕТНЫМИ ЗАПИСЯМИ

- user не может абсолютно ничего делать с учетками. Может менять свои данные, просматривать всех участников его компании, смотреть карточку каждого. В С Ё

- techadmin может создать пользователя с ролью User. Далее может все что юзер

- admin может создать пользователя с любой ролью, отредактировать имя и роль у существующих, заморозить любого пользователя. Почему не удаление? эээ.. удаление учётки = удаление всех тикетов. Поэтому реализовал заморозку

- owner может создать любого пользователя в любой компании и всё вышеописанное. помимо может изменить почту и компанию у любого юзера, НО не пароль. может перманентно дельнуть любого юзера. 

## ВЗАИМОДЕЙСТВИЕ С КОМПАНИЯМИ 

Компании может создавать только owner. создав компанию и открыв её карточку, может создать любого юзера. он будет создаваться в компании карточка которой открыта. 

также не забывайте, снизу напишу баги которые заметил в процессе глубокого теста. но это чисто фронтенд баги, в бэке я нулевый )

## СТРАНИЦЫ 

- дашборд - выстраивается статистика по всем тикетам которые видит пользователь. в нашем случае user видит только свои тикеты, поэтому диаграммы у него будут свои. hidden тикеты видит только овнер поэтому они нигде не будут фигурировать

- тикеты - лист тикетов. юзер видит свои, админ и техадмин видят все тикеты внутри своей компании. всё что может юзер = его закрыть. админ и техадмин имеют доступ к изменению статуса на другие, а также к окну тикета.
- окно тикета - инфа о создателе, контейнер для изменения содержания, подробные логи кто что когда поменял. тет-а-тет чат между всеми кто может открыть окно тикета (эксплоит = юзер может открыть окно тикета дописав его линк. во фронте он нигде не натыкает окно тикета, кнопок для него попросту нет)

- пользователи - список всех пользователей для owner + сортировка по компании. ///////// список участников компании для admin, techadmin, user.
- есть возможность создать юзера (овнер выбирает компанию в которой он создастся. админ и техадмин не выбирают, новый пользователь сразу создаётся в их компании)
- работающий функционал заморозки, удаления, редактирования учетной записи. работает в зависимости от роли, выше описал кто ччто может. 

- компании - список всех компаний. ВИДИТ ТОЛЬКО ОВНЕР !!!!!!!!!!!!!. можно создать компанию.
- карточка компании - открыв карточку есть некоторая инфа о компании и список пользователей ИМЕННО этой компании.
- в карточке компании можно создать учётку, создастся сразу в компании карточка которой открыта.

- настройки. тут все юзеры равны.
- тёмная тема
- connecting the dots точки красивые
- автосворачивание сайдбара (при наведении разворачивается. по дефолту, сверху есть переключатель скрыть/раскрыть сайдбар перманентно) . сдвигает содержимое сайта. фиксите в идеале

- профиль
- тут тоже все равны, все могут о себе поменять всю инфу. чтобы поменять фио просто введите новое имя. чтобы поменять почту введите текущий пароль. чтобы его обновить соответственно тоже вводите нынешний праоль.

остальные инпуты не работают, добавлены для галочки.




в остальном вроде все, основная логика описана. всякие тыкалки для красоты увидите сами, но их немного 


 ## ЧТО НУЖНО ФИКСИТЬ ИЛИ ДОБАВЛЯТЬ 

в обязательном порядке:
- ТЕСТ БЭКА НА ДЫРЫ


- Логи для учётной записи (кто, когда поменял почту, пароль, имя, роль, деактивировал активировал учётку)
- Переделать дашборд
- Добавить отображение логов компании для owner (чтобы овнер видил фулл логи компании- кто что создал отредактироваал удалил итд). С поиском и удобной фильтрацией
- В карточке компании, добавить сортировку тикетов по компании. С поиском и удобной фильтрацией
- Добавить поиск в тикетах
- добавить Аватарки
- Фикс точек (на белой теме они не видны. которые connecting the dots)
- Адекватизировать редактирование учётной записи админами
- Адекватизировать окно тикета. Дать пользователю право редактировать тикет, добавить чат между админами и пользователем. крчгвр дать юзеру право видеть окно тикета но урезать функционал как посчитаете нужным
- Переделать логику уведомлений. привязать к настройкам, добавить их таймер к примеру. оч полезная фича имхо 
- Адекватизировать все листы. при большом колве текста вы ничего не сможете
- Адекватизировать всю фронтенд часть. это потреблядство написанное на коленке аишкой. ну или хотябы чутьчуть попытаться сделать его интуитивно понятным хз
- адекватизировать структуру приложения. дубли есть и так далее
также в проекте есть риадми созданный аишкой почитайте может еще чтото новое узнаете (сначала англ потом ру идёт). я больной на голову


