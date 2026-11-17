#!/bin/sh
# Kanemori single-file build: concatenates the section files in src/ into index.html (v0.5 adds p15-p18 before p7)
cd "$(dirname "$0")" && cat src/p1.html src/p2.js src/p3.js src/p4.js src/p5.js src/p6.js src/p8.js src/p9.js src/p10.js src/p11.js src/p12.js src/p13.js src/p14.js src/p15.js src/p16.js src/p17.js src/p18.js src/p7.js > index.html
