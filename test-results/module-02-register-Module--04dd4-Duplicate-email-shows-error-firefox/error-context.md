# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "ShopEase" [ref=e4] [cursor=pointer]:
        - /url: /Home.html
      - generic [ref=e5]:
        - searchbox "Search" [ref=e6]
        - button "Search" [ref=e7] [cursor=pointer]
      - navigation [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /Home.html
        - link "Catalog" [ref=e10] [cursor=pointer]:
          - /url: /Product.html
        - link "Login" [ref=e11] [cursor=pointer]:
          - /url: /Login.html
        - link "Register" [ref=e12] [cursor=pointer]:
          - /url: /Register.html
  - main [ref=e13]:
    - generic [ref=e14]:
      - heading "Create account" [level=2] [ref=e15]
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Full name
          - textbox "Full name" [active] [ref=e19]: A
        - generic [ref=e20]:
          - generic [ref=e21]: Email
          - textbox "Email" [ref=e22]: reg_tc_1774862490283_6@example.com
        - generic [ref=e23]:
          - generic [ref=e24]: Password (min 8)
          - textbox "Password (min 8)" [ref=e25]: Password123!
        - button "Register" [ref=e26] [cursor=pointer]
      - paragraph [ref=e27]:
        - link "Already have an account?" [ref=e28] [cursor=pointer]:
          - /url: /Login.html
  - contentinfo [ref=e29]: ShopEase
```