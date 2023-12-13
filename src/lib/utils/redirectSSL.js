if (location.protocol === 'http:' && (location.port === '' || ['80', '443'].indexOf(location.port) !== -1)) {
    location.protocol = 'https:'
}
