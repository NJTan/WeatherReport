// const environment = 'production'
const environment = 'development'
const release = '1.0.0'

let config = {
    environment,
    release,
    app_id: 'wxfc0304f1481be3ce',
    sentry: {
        dsn: '',
        options: {
            environment,
            release,
            allowDuplicates: true, // 允许相同错误重复上报
            sampleRate: 0.5 // 采样率
        }
    }
}

export { config }
