/*
*  How to make a super-fancy Ruby-style autovivifying hash in Javascript
*
*  We'll be using Proxies, which allow us to replace object access methods with our own.
*
*  This takes a function much in the same way that Ruby's hash constructor takes a block, and returns a hash
*  whose getter will call this function if the key isn't in the hash yet.  We want to use 'k in h' as our check,
*  because checking for h[k] could turn out false if k was actually set, but to something falsy.
*/
const fancyHash = (f = () => {}) => new Proxy({}, {get: (h, k) => ((k in h || f(h, k)) && h[k])});
const defaultToEmptyArray = (h, k) => (h[k] = []);
const h1 = fancyHash(defaultToEmptyArray);

h1.foo.push(13);
h1.foo.push(7);
h1.bar.push(15);
h1; // { foo: [ 13, 7 ], bar: [ 15 ] }, proves that they're not references to the same array.

/*
*  Now, suppose we want to create a hash that recursively references other values, and which will define them if
*  they're not there.  My favorite example is a hash that will calculate a Fibonacci number.  We might think that
*  something like what appears below will work.
*
*  The isNaN clause makes sure we're dealing with a number, and not a symbol or something else added by the REPL
*  as part of what it does make the object displayable.  You can do probably do without it if you run the code in
*  Chrome inspector's console.
*/
const fib = (h, k) => isNaN(+k.toString()) || (h[k] = h[k - 1] + h[k - 2]);
const h2 = fancyHash(fib);
h2[0] = h2[1] = 1;

h2[2];  // 2, So far so good
h2[10]; // NaN

/*
*  The problem is that the getter in the Proxy we created calls f on the object we were proxying, which is a
*  non-fancy hash.  We'll make a super-fancy one that makes sure f is called on something that can recurse, by passing
*  it a super-fancy hash that has f itself as the default function/block, and the original object as object to proxy.
*/
const superFancyHash = (f = () => {}, obj = {}) => new Proxy(obj, {get: (h, k) => ((k in h || f(superFancyHash(f, h), k)) && h[k])});
const h3 = superFancyHash(fib);
h3[0] = h3[1] = 1;

h3[2];  // 2, So far so good
h3[100]; // 573147844013817200000, Boom
h3; // Mind explodes
