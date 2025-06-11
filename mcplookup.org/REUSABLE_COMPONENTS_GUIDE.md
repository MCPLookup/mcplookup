# Reusable Server & Repository Components

## 🎯 **Problem Solved: Component Reusability**

We needed consistent server and repository displays across:
- ✅ **User Profiles** - Show owned content
- ✅ **Search Results** - Browse servers/repos
- ✅ **Server Pages** - Individual server details
- ✅ **Admin Panels** - Manage content
- ✅ **Public Listings** - Directory views

## 🧩 **Reusable Components Created**

### **1. Server Display Components**
```typescript
import { 
  ServerDisplay, 
  ServerList, 
  ServerGrid,
  ServerEditModal 
} from '@/components/servers';

// Single server card
<ServerDisplay 
  server={server}
  currentUserId={user?.id}
  variant="card"
  showEditButton={true}
  onEdit={handleEdit}
/>

// List of servers
<ServerList
  servers={servers}
  currentUserId={user?.id}
  variant="list"
  showEditButton={true}
  onEdit={handleEdit}
/>

// Grid layout
<ServerGrid
  servers={servers}
  currentUserId={user?.id}
  columns={{ base: 1, md: 2, lg: 3 }}
  onEdit={handleEdit}
/>
```

### **2. Repository Display Components**
```typescript
import { 
  RepositoryDisplay, 
  RepositoryList 
} from '@/components/repositories';

// Single repository card
<RepositoryDisplay 
  repository={repo}
  currentUserId={user?.id}
  variant="card"
  showEditButton={true}
  onEdit={handleEdit}
/>

// List of repositories
<RepositoryList
  repositories={repos}
  currentUserId={user?.id}
  variant="list"
  onEdit={handleEdit}
/>
```

## 🎨 **Display Variants Available**

### **Server Display Variants:**
```typescript
// Compact - Minimal horizontal layout
<ServerDisplay variant="compact" server={server} />

// List - Detailed vertical layout  
<ServerDisplay variant="list" server={server} />

// Card - Full-featured card layout
<ServerDisplay variant="card" server={server} />

// Detailed - Maximum information display
<ServerDisplay variant="detailed" server={server} />
```

### **Repository Display Variants:**
```typescript
// Compact - Minimal horizontal layout
<RepositoryDisplay variant="compact" repository={repo} />

// List - Detailed vertical layout
<RepositoryDisplay variant="list" repository={repo} />

// Card - Full-featured card layout  
<RepositoryDisplay variant="card" repository={repo} />
```

## 🔧 **Edit Modal Integration**

### **Server Edit Modal:**
```typescript
import { ServerEditModal, ServerEditData } from '@/components/servers';

// Edit modal with comprehensive form
<ServerEditModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  server={selectedServer}
  onSave={handleServerSave}
/>

// Save handler
const handleServerSave = async (serverId: string, data: ServerEditData) => {
  const response = await fetch(`/api/servers/${serverId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return { 
    success: response.ok, 
    error: response.ok ? undefined : await response.json().error 
  };
};
```

## 🎯 **Usage Examples**

### **1. Profile Page Implementation:**
```typescript
// In ProfileTab component
import { ServerList, RepositoryList } from '@/components/servers';

function ProfileTab() {
  const [userServers, setUserServers] = useState<BaseServer[]>([]);
  const [ownedRepos, setOwnedRepos] = useState<BaseRepository[]>([]);

  return (
    <VStack gap={6}>
      {/* GitHub Repositories Section */}
      <Card.Root>
        <Card.Header>
          <Heading>Owned GitHub Repositories</Heading>
        </Card.Header>
        <Card.Body>
          <RepositoryList
            repositories={ownedRepos}
            currentUserId={user?.id}
            variant="list"
            showEditButton={true}
            onEdit={handleRepositoryEdit}
          />
        </Card.Body>
      </Card.Root>

      {/* MCP Servers Section */}
      <Card.Root>
        <Card.Header>
          <Heading>Registered MCP Servers</Heading>
        </Card.Header>
        <Card.Body>
          <ServerList
            servers={userServers}
            currentUserId={user?.id}
            variant="list"
            showEditButton={true}
            onEdit={handleServerEdit}
          />
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
```

### **2. Search Results Page:**
```typescript
// In SearchResults component  
import { ServerGrid } from '@/components/servers';

function SearchResults({ searchResults }) {
  return (
    <ServerGrid
      servers={searchResults}
      currentUserId={user?.id}
      showEditButton={false} // No edit in search
      columns={{ base: 1, md: 2, lg: 3 }}
      loading={isLoading}
      emptyMessage="No servers found matching your search"
    />
  );
}
```

### **3. Server Directory Page:**
```typescript
// In ServerDirectory component
import { ServerList } from '@/components/servers';

function ServerDirectory() {
  return (
    <ServerList
      servers={allServers}
      variant="compact" // Compact for directory
      showEditButton={false}
      showOwnershipBadge={true}
      showCapabilities={true}
    />
  );
}
```

### **4. Individual Server Page with Edit:**
```typescript
// In ServerPage component
import { ServerDisplay, ServerEditModal } from '@/components/servers';

function ServerPage({ server }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwner = user?.id === server.owner_user_id;

  return (
    <VStack gap={6}>
      <ServerDisplay
        server={server}
        currentUserId={user?.id}
        variant="detailed"
        showEditButton={isOwner}
        onEdit={() => setShowEditModal(true)}
      />
      
      {isOwner && (
        <ServerEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          server={server}
          onSave={handleServerUpdate}
        />
      )}
    </VStack>
  );
}
```

## 🔧 **Component Features**

### **Smart Edit Button Logic:**
- ✅ **Owner Detection:** Only show edit button to server owners
- ✅ **Context Aware:** Hide edit button in search/public contexts
- ✅ **Permission Based:** Respect user permissions

### **Privacy Aware Display:**
- ✅ **Respect Privacy Settings:** Hide private content appropriately
- ✅ **Conditional Rendering:** Show/hide based on user preferences
- ✅ **Safe Defaults:** Private by default

### **Responsive Design:**
- ✅ **Mobile Friendly:** Works on all screen sizes
- ✅ **Grid Layouts:** Configurable column counts
- ✅ **Flexible Variants:** Choose appropriate layout for context

### **Loading States:**
- ✅ **Skeleton Loading:** Beautiful loading animations
- ✅ **Empty States:** Helpful messages when no content
- ✅ **Error Handling:** Graceful error display

## 🎯 **Benefits Achieved:**

### **✅ Consistency:**
- Same server display everywhere
- Unified edit experience
- Consistent styling and behavior

### **✅ Maintainability:**
- Single source of truth for server display logic
- Easy to update styles globally
- Centralized component logic

### **✅ Developer Experience:**
- Simple import and use
- TypeScript support with proper interfaces
- Clear prop documentation

### **✅ User Experience:**
- Consistent interactions across the app
- Edit buttons exactly where users expect them
- Professional, polished interface

## 🚀 **Result: Professional, Reusable Components**

Now servers and repositories display consistently everywhere with:
- **🎨 Beautiful UI** - Professional cards and layouts
- **⚙️ Edit Integration** - Edit buttons for owners where appropriate
- **🔒 Privacy Aware** - Respects user privacy settings  
- **📱 Responsive** - Works perfectly on all devices
- **🧩 Reusable** - Use anywhere with minimal code

**Perfect for profiles, search results, server pages, and admin panels!** ✨
