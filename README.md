## Steps to setup the starter template

1. Clone the project

```
git clone https://github.com/SahilMalakar/hotel-Service-practice.git <ProjectName>
```

2. Move in to the folder structure

```
cd <ProjectName>
```

3. Install pnpm dependencies

```
pnpm i
```

4. Create a new .env file in the root directory and add the `PORT` env variable

```
echo PORT=3000 >> .env
```

5. Start the express server

```
pnpm run dev
```