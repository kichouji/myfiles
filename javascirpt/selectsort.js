let a = [12,3,9,7,6,2];

for (let j = 0; j < a.length-1; j++) {
  console.log(`★j:${j}`);
  var b = j;
  for (let i = j; i < a.length; i++) {
    console.log(`b=${b}：i=${i}`);
    console.log(`${a[b]}と${a[i]}を比較します`);
    if (a[b]>a[i]) {
      b = i;
    }
    console.log(`最小値は${a[b]}`);
  }
  var tmp = a[j];
  a[j] = a[b];
  a[b] = tmp;
  console.log(a);
}
console.log(a);