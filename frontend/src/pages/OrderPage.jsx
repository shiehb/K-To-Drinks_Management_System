import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Search, Plus, Minus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "../css/order.css"
import api from "../api/api_url"

// Import your product images
import cokeImg from "../css/products/coke.webp"
import lemonDouImg from "../css/products/lemon-dou.webp"
import spriteImg from "../css/products/sprite.webp"
import royalImg from "../css/products/royal.webp"
import wilkinsImg from "../css/products/wilkins.webp"

export default function OrderPage() {
  const { darkMode, toggleDarkMode } = useAuth()
  
  // State for store selection
  const [selectedStore, setSelectedStore] = useState("")
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(false)

  // State for product search and selection
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState([
    { id: 1, name: "Coke", img: cokeImg },
    { id: 2, name: "Lemon Dou", img: lemonDouImg },
    { id: 3, name: "Sprite", img: spriteImg },
    { id: 4, name: "Royal", img: royalImg },
    { id: 5, name: "Wilkins", img: wilkinsImg },
  ])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [availableStock, setAvailableStock] = useState(0)
  const [orderItems, setOrderItems] = useState([])
  const [selectedSize, setSelectedSize] = useState("")
  const TAX_RATE = 2.0

  // Get available sizes based on selected category
  const getAvailableSizesForCategory = (categoryId) => {
    switch(categoryId) {
      case 1: // Coke
        return ['1.5L', '1L', '237ml', 'mismo (pet bottle)', 'swakto (pet bottle)'];
      case 2: // Lemon Dou
        return ['1.5L', '1L', '237ml', 'mismo (pet bottle)', 'swakto (pet bottle)'];
      case 3: // Sprite
        return ['1.5L', '1L', '237ml', 'mismo (pet bottle)', 'swakto (pet bottle)'];
      case 4: // Royal
        return ['1.5L', '1L', '237ml', 'mismo (pet bottle)', 'swakto (pet bottle)'];
      case 5: // Wilkins
        return ['7L', '1L', '500ml', '330ml'];
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id)
      setSelectedSize('')
      setSelectedProduct(null)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedSize && products.length > 0) {
      const productForSize = products.find(p => p.size === selectedSize);
      if (productForSize) {
        setSelectedProduct(productForSize);
        setAvailableStock(productForSize.stock);
      }
    }
  }, [selectedSize, products])

  const fetchStores = async () => {
    setStoresLoading(true)
    try {
      const response = await api.get("/stores/")
      const storeData = response.data.map((store) => ({
        id: store.id,
        name: store.name,
      }))
      setStores(storeData)
      if (storeData.length > 0) {
        setSelectedStore(storeData[0].id.toString())
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
      toast.error("Failed to load stores")
      setStores([])
    } finally {
      setStoresLoading(false)
    }
  }

  const fetchProducts = async (categoryId) => {
    setProductsLoading(true);
    try {
      // First try to fetch from API
      try {
        const response = await api.get(`/products?category_id=${categoryId}`);
        
        if (response.data && response.data.length > 0) {
          const productsData = response.data.map(product => ({
            id: product.id,
            name: product.brand,
            price: parseFloat(product.price),
            stock: parseInt(product.stock_quantity),
            size: product.size,
            category: product.category_id
          }));
  
          setProducts(productsData);
          return;
        }
      } catch (apiError) {
        console.log("Falling back to mock data due to API error:", apiError);
      }
  
      // Fallback to mock data if API fails
      let mockProducts = [];
      switch(categoryId) {
        case 1: // Coke
          mockProducts = [
            { id: 1, name: "Coke", price: 55.0, stock: 100, size: "1.5L" },
            { id: 2, name: "Coke", price: 40.0, stock: 150, size: "1L" },
            { id: 3, name: "Coke", price: 20.0, stock: 200, size: "237ml" },
            { id: 4, name: "Coke", price: 15.0, stock: 180, size: "mismo (pet bottle)" },
            { id: 5, name: "Coke", price: 12.0, stock: 120, size: "swakto (pet bottle)" }
          ];
          break;
        case 2: // Lemon Dou
          mockProducts = [
            { id: 6, name: "Lemon Dou", price: 60.0, stock: 80, size: "330 (can)"},
            { id: 7, name: "Lemon Dou", price: 45.0, stock: 90, size: "1L" },
            { id: 8, name: "Lemon Dou", price: 25.0, stock: 150, size: "237ml" },
            { id: 9, name: "Lemon Dou", price: 18.0, stock: 100, size: "mismo (pet bottle)" },
            { id: 10, name: "Lemon Dou", price: 15.0, stock: 110, size: "swakto (pet bottle)" }
          ];
          break;
        case 3: // Sprite
          mockProducts = [
            { id: 11, name: "Sprite", price: 50.0, stock: 120, size: "1.5L" },
            { id: 12, name: "Sprite", price: 38.0, stock: 140, size: "1L" },
            { id: 13, name: "Sprite", price: 18.0, stock: 180, size: "237ml" },
            { id: 14, name: "Sprite", price: 14.0, stock: 160, size: "mismo (pet bottle)" },
            { id: 15, name: "Sprite", price: 12.0, stock: 130, size: "swakto (pet bottle)" }
          ];
          break;
        case 4: // Royal
          mockProducts = [
            { id: 16, name: "Royal", price: 52.0, stock: 90, size: "1.5L" },
            { id: 17, name: "Royal", price: 39.0, stock: 110, size: "1L" },
            { id: 18, name: "Royal", price: 19.0, stock: 160, size: "237ml" },
            { id: 19, name: "Royal", price: 15.0, stock: 140, size: "mismo (pet bottle)" },
            { id: 20, name: "Royal", price: 13.0, stock: 100, size: "swakto (pet bottle)" }
          ];
          break;
        case 5: // Wilkins
          mockProducts = [
            { id: 21, name: "Wilkins Distilled", price: 120.0, stock: 50, size: "7L" },
            { id: 22, name: "Wilkins Distilled", price: 25.0, stock: 200, size: "1L" },
            { id: 23, name: "Wilkins Distilled", price: 15.0, stock: 180, size: "500ml" },
            { id: 24, name: "Wilkins Distilled", price: 12.0, stock: 150, size: "330ml" },
          ];
          break;
        default:
          mockProducts = [];
      }
  
      setProducts(mockProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, availableStock))
    setQuantity(newQuantity)
  }

  // Handle adding item to order
  const handleAddToOrder = () => {
    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }

    if (!selectedStore) {
      toast.error("Please select a store")
      return
    }

    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }

    // Create a unique key combining product ID and size
    const itemKey = `${selectedProduct.id}-${selectedSize}`;

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(
      (item) => item.key === itemKey
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setOrderItems(updatedItems);
    } else {
      // Add new item with size information
      const newItem = {
        key: itemKey,
        id: selectedProduct.id,
        description: `${selectedProduct.name} ${selectedSize}`,
        quantity: quantity,
        unitPrice: selectedProduct.price,
        total: selectedProduct.price * quantity,
        size: selectedSize
      };

      setOrderItems([...orderItems, newItem]);
    }

    // Reset quantity
    setQuantity(1);
    toast.success("Item added to order");
  }

  // Handle completing the order
  const handleCompleteOrder = () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to your order")
      return
    }

    // Here you would typically send the order to your backend
    toast.success("Order submitted successfully!")

    // Reset order
    setOrderItems([])
    setQuantity(1)
    setSelectedProduct(null)
    setSelectedCategory(null)
    setSelectedSize("")
  }

  // Calculate order totals with proper number handling
  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  const taxAmount = (subtotal * TAX_RATE) / 100
  const totalAmount = subtotal + taxAmount

  return (
    <div className={`order-page ${darkMode ? 'dark' : ''}`}>
      <div className="order-container">
        <div className="product-selection">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" />
            </div>

            <div className="store-selector">
              <select 
                value={selectedStore} 
                onChange={(e) => setSelectedStore(e.target.value)} 
                className="store-select"
              >
                <option value="">STORE NAME</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="categories-section">
            <h3 className="section-title">CATEGORIES</h3>
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${selectedCategory?.id === category.id ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="category-img">
                    <img 
                      src={category.img} 
                      alt={category.name} 
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="size-section">
            {selectedCategory && (
              <>
                <h4 className="size-title">AVAILABLE SIZES</h4>
                <div className="size-options">
                  {getAvailableSizesForCategory(selectedCategory.id).map((size, index) => {
                    const productForSize = products.find(p => p.size === size);
                    return (
                      <button
                        key={index}
                        className={`size-button ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedSize(size);
                          if (productForSize) {
                            setSelectedProduct(productForSize);
                            setAvailableStock(productForSize.stock);
                          }
                        }}
                        disabled={!productForSize}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="quantity-section">
            <div className="quantity-control">
              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="quantity-input"
                min="1"
                max={availableStock}
              />

              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableStock}
              >
                <Plus size={20} />
              </button>

              <span className="stock-info">{availableStock} available stocks</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="add-button" onClick={handleAddToOrder}>
              ADD
            </button>
          </div>
        </div>

        <div className="order-summary">
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <tr key={item.key}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>₱{item.unitPrice.toFixed(2)}</td>
                      <td>₱{item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-order">
                      No items added yet
                    </td>
                  </tr>
                )}
                {/* Empty rows to fill space */}
                {Array.from({ length: Math.max(0, 5 - orderItems.length) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="empty-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-notes">
            <div className="notes-section">
              <h4>NOTES</h4>
              <textarea 
                className="notes-input" 
                placeholder="Add notes here..."
              ></textarea>
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>SUBTOTAL</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>TAX RATE</span>
                <span>{TAX_RATE.toFixed(1)}%</span>
              </div>
              <div className="total-row">
                <span>TAX AMOUNT</span>
                <span>₱{taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL AMOUNT DUE</span>
                <span>₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="complete-order">
            <button className="done-button" onClick={handleCompleteOrder}>
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}