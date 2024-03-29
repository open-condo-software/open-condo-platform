Это инструкция по установке для владельцев компьютеров с операционной системой Windows. Для корректной работы нужно два сертификата — корневой и выпускающий.

### Установите корневой сертификат

1. [Скачайте корневой сертификат](/tls/windows/russian_trusted_root_ca.cer) → перейдите в папку «Загрузки» → выберите «Russian Trusted Root CA.cer» → нажмите «Открыть» → выберите «Установить сертификат...»

   **[Скачать корневой сертификат](/tls/windows/russian_trusted_root_ca.cer)**

   ![Image11](/tls/windows/windows-root-cert.png "Сведения о корневом сертификате")

2. В окне «Мастер импорта сертификатов» выберите «Текущий пользователь» → нажмите «Далее» → выберите «Поместить все сертификаты в следующее хранилище» → нажмите «Обзор» → выберите «Доверенные корневые центры сертификации» → нажмите «Далее»

   ![Image12](/tls/windows/windows-import-root-cert.png "Мастер импорта корневого сертификата")

3. В окне «Завершение мастера импорта сертификатов» нажмите «Готово» → выберите «Ок»

   Если появится окно «Предупреждение системы безопасности» → нажмите «Да»

   ![Image13](/tls/windows/windows-complete-import-root-cert.png "Завершение импорта корневого сертификата")

### Установите выпускающий сертификат

1. [Скачайте выпускающий сертификат](tls/windows/russian_trusted_sub_ca.cer) → перейдите в папку «Загрузки» → выберите «Russian Trusted Sub CA.cer» → нажмите «Открыть» → выберите «Установить сертификат...»

   **[Скачать выпускающий сертификат](tls/windows/russian_trusted_sub_ca.cer)**

   ![Image21](/tls/windows/windows-issuer-cert.webp "Сведения о выпускающем сертификате")

2. В окне «Мастер импорта сертификатов» выберите «Текущий пользователь» → нажмите «Далее» → выберите «Автоматически выбрать хранилище на основе типа сертификата» → нажмите «Далее»

   ![Image22](/tls/windows/windows-import-issuer-cert.webp "Мастер импорта выпускающего сертификата")

3. В окне «Завершение мастера импорта сертификатов» нажмите «Готово» → выберите «Ок»

   ![Image23](/tls/windows/windows-complete-import-issuer-cert.webp "Завершение импорта выпускающего сертификата")

### Очистите кэш вашего браузера

После установки сертификатов очистите кэш вашего браузера. Это необходимо для корректной работы с веб-ресурсами, защищенными сертификатами Национального УЦ Минцифры России
