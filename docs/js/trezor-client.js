class TrezorClient extends RestClient { // https://github.com/trezor/blockbook/blob/master/docs/api.md#get-transaction
    constructor() {
        super();
        this.domain = `https://blockbook.electrum-mona.org/`
    }
    async tx(txid) { // 指定txidの取引情報を返す（vinのアドレスを取得するのが今回の目的。支払・受取を判別するため）
        return await this.get(`${this.domain}api/v2/tx/${txid}`)
    }
    async address(address, options={}) { // 指定アドレスの取引txid一覧を取得する
        const query = this.#makeAddrParams(options)
        // Access to fetch at 'https://blockbook.electrum-mona.org/api/v2/address/MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu' from origin 'https://localhost' has been blocked by CORS policy: Request header field content-type is not allowed by Access-Control-Allow-Headers in preflight response.
        // https://blog.foresta.me/posts/http_preflight_request/
        const headers = {'Content-Type': 'text/plain'}
        return await this.get(`${this.domain}api/v2/address/${address}${(query) ? '?' + query : ''}`, headers)
        //return JSON.parse(await this.get(`${this.domain}api/v2/address/${address}${(query) ? '?' + query : ''}`, headers))
    }
    #makeAddrParams(options) {
        const params = new URLSearchParams()
        const names = ['page', 'pageSize', 'from', 'to', 'details', 'contract']
        for (name of names) {
            if (options.hasOwnProperty(name)) {
                params.append(name, this.#getAddrValue(name, options[name]))
            }
        }
        return params.toString()
    }
    #getAddrValue(name, value) {
        if (name == 'page') { return this.#jadgeAddrPage(value) }
        if (name == 'pageSize') { return this.#jadgeAddrPageSize(value) }
        if (name == 'details') { return this.#jadgeAddrDetails(value) }
        return value
    }
    #jadgeAddrDetails(details) {
        const valids = ['basic', 'tokens', 'tokenBalances', 'txids', 'txslight', 'txs']
        if (valids.includes(details)) { return details }
        return 'txids'
    }
    #jadgeAddrPageSize(pageSize) {
        if (isNaN(pageSize)) { return 1000 }
        if (pageSize < 1) { return 1000 }
        if (1000 < pageSize) { return 1000 }
        return pageSize
    }
    #jadgeAddrPage(page) {
        if (isNaN(page)) { return 1 }
        if (page < 1) { return 1 }
        return page
    }
}
