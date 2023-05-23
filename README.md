# @nfjs/winston-logger

**ОГЛАВЛЕНИЕ**
- [Используемые понятия](#Используемые-понятия)
- [Принцип работы](#Принцип-работы)
- [Конфигурация](#Конфигурация)

### Используемые понятия
`Логгер` - инстанс класса для выполнения логгирования по заданным настройкам.
`Транспорт` - настройки тога куда именно будет произведено логгирование - в консоль процесса, в файл (с возможной ротацией), по http и прочее. 
`Контейнер` - множество именованных логгеров.
### Принцип работы
Позволяет сконфигурировать несколько логгеров через конфигурационный файл, в котором заданы настройки для каждого в отдельности. При проходе по конфигурационному файлу недостающие настройки берутся из значений по умолчанию.
Все они помещаются в контейнер под меткой `loggers`. Логгер с кодом **default** помещается в контейнер под меткой `logger`.
### Конфигурация
|Свойство|Тип|Назначение|Значение по умолчанию|
|---|---|---|---|
|`levels`|string|Уровни логов|winston.config.syslog.levels (emerg,alert,crit,error,warning,notice,info,debug)|
|`defaultMeta`|Object|Набор свойств со значениями, которые дополняют объект лога| { instanceName: instance_name } |
|`formats`|Object|Перечень поддерживаемых модулем форматов преобразования лога, каждый со своими возможными настройками| { timestamp: {}, errors: { stack: true }, json: {} }|
|`transports`|Object|Набор транспортов в виде объектов. Каждый ключ - отдельный транспорт со своими настройками||
|`.type`|string|Тип транспорта, отвечающий куда отправлять логи. Например, `Console`,`File`|'Console'|
|`.options`|Object|Настройки транспорта в зависимости от типа. Часть ниже описана, как общие. Остальные в документации пакета||
|`..handleExceptions`|boolean|Логгировать ли необработанные исключения (uncaughtException) процесса|true|
|`..handleRejections`|boolean|Логгировать ли необработанные исключения (uncaughtRejection) процесса|true|
|`..level`|string|Уровень ниже которого включительно логгировать события|'info'|
|`..formats`|Object|Аналогично `formats`. Не рекомендуется использовать из-за бага в библиотеке на данный момент (winston-transport@4.4.0)||
Подробнее про все возможные настройки в [документации](https://www.npmjs.com/package/winston)

Настройки логгера по умолчанию выглядят следующим образом
```json
"@nf/winston-logger": {
    "default": {
        "levels": "syslog",
        "formats": {
            "timestamp": {},
            "errors": {
                "stack": true
            },
            "json": {}
        },
        "transports": {
            "default": {
                "type": "Console",
                "options": {
                    "handleExceptions": true,
                    "handleRejections": true,
                    "level": "info"
                }
            }
        }
    }
}
```        
Что соответствует коду создания логгера модуля **winston**        
```js
import winston from 'winston';
const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    transports: [new winston.transports.Console({
        level: 'info',
        handleExceptions: true,
        handleRejections: true
    })]
})
```

### Пример использования
Работает только при запущенном полностью приложении, так как помещается в контейнер при старте приложения.
```js
import { container } from '@nf/core';
import { v4 } from 'uuid/v4';
// Из контейнера логгеров выбрали настроенный, например, только для интеграционных сервисов
const logger = container.loggers.get('integrations');
// Здесь использовалась возможность "закрелять" часть свойств для последующих вызовов логгирования, чтобы избежать повторений.
const logg = logger.child({ logType: 'integrationFRMR', uuid: v4() });
try {
    logg.info('start');
    // something
    logg.info('end');
} catch (e) {
    logg.info(e);
}
```
