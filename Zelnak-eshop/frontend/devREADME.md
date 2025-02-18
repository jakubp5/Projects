## Variables

pro přidání proměnné je potřeba přidat proměnnou do následujících míst

-   variables.module.scss/:root
-   variables.module.scss/:export
-   variables.ts/

:export totiž zajišťuje, že můžeme proměnnou použít v js/ts souborech

## Nejdriv <Link> a pak <Typography>

## <TextField autocomplete="" />

https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill

## Margin na inputu bez labelu se dá odstranit přidánim stylu na kterejkoliv parent element

```tsx
<Grid
    key={index}
    container
    sx={{
        '& legend': { display: 'none' },
        '& fieldset': { top: 0 },
    }}>
    {{ children }}
</Grid>
```

## Barva undelined linku

stačí přidat color inherit ` <MuiLink underline="hover" color="inherit">`
