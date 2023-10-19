export const formatBigInt = (obj: any) => {
  return Object.keys(obj).reduce((rs, key) => {
    if (typeof obj[key] === 'bigint' && obj[key] !== null) {
      rs[key] = obj[key].toString();
    } else rs[key] = obj[key];

    return { ...rs };
  }, {});
};
