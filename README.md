This is server code for my website.

https://www.youtube.com/watch?v=nQdyiK7-VlQ <br>
https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2

```
(ssh ...)
tail -f logs/foo.err (show logs)
cd server
nohup php -S localhost:3000 > ../logs/foo.log 2> ../logs/foo.err < /dev/null &
ps -ef (to find the nohup process)
```
https://stackoverflow.com/a/29172 <br>
https://stackoverflow.com/a/25082918
