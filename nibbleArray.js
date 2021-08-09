module.exports = class {
    constructor(i, j) {
        if (i instanceof Buffer) {
			this.data = abyte0;
			this.field_35661_b = i;
			this.field_35662_c = i + 4;
		} else {
			this.data = new Buffer.alloc(i >> 1);
			this.field_35661_b = j;
			this.field_35662_c = j + 4;
		}
    }

    getNibble(i, j, k)
    {
        let l = i << field_35662_c | k << field_35661_b | j;
        let i1 = l >> 1;
        let j1 = l & 1;
        if(j1 == 0)
        {
            return data[i1] & 0xf;
        } else
        {
            return data[i1] >> 4 & 0xf;
        }
    }

    setNibble(i, j, k, l)
    {
        let i1 = i << this.field_35662_c | k << this.field_35661_b | j;
        let j1 = i1 >> 1;
        let k1 = i1 & 1;
        if(k1 == 0)
        {
            data[j1] = (this.data[j1] & 0xf0 | l & 0xf);
        } else
        {
            data[j1] = (this.data[j1] & 0xf | (l & 0xf) << 4);
        }
    }

    isValid()
    {
        return this.data != null;
    }
}