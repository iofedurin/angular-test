export const filterStr = (value: string | undefined, filterValue: string) => {
  if (!filterValue) {
    return true;
  }
  if (!value) {
    return false;
  }
  return value.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
};
