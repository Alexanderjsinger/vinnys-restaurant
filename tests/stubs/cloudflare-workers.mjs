const writes = [];

export const env = {
  DB: {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              writes.push({ sql, values });
            },
          };
        },
        async run() {
          writes.push({ sql, values: [] });
        },
      };
    },
  },
};

export function writesRecorded() {
  return writes;
}
